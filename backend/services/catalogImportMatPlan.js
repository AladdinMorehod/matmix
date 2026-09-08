const { normalizeMatCode, validateMatCode } = require("./catalogCodeNormalization");

function compareIds(left, right) {
    return String(left).localeCompare(String(right), "en", { numeric: true });
}

function canonicalize(value) {
    if (Array.isArray(value)) {
        return value.map(canonicalize).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
    }
    return value;
}

function conflict(code, details = {}) {
    return canonicalize({ code, ...details });
}

function identityKey(item) {
    return item.productId ? `product:${item.productId}` : `new:${item.sourceRowId}`;
}

function planMatReassignments({ products = [], rows = [] } = {}) {
    const conflicts = [];
    const productById = new Map();
    const ownerByMat = new Map();

    products.forEach(product => {
        const id = Number(product.id);
        if (!Number.isInteger(id) || id <= 0) return;
        const normalized = { ...product, id, oldMat: normalizeMatCode(product.externalId ?? product.external_id) };
        productById.set(id, normalized);
        if (!normalized.oldMat) return;
        if (ownerByMat.has(normalized.oldMat)) {
            conflicts.push(conflict("DUPLICATE_CURRENT_MAT", { mat: normalized.oldMat, productIds: [ownerByMat.get(normalized.oldMat).id, id] }));
        } else {
            ownerByMat.set(normalized.oldMat, normalized);
        }
    });

    const items = [];
    const itemByProductId = new Map();
    const itemByTargetMat = new Map();
    rows.forEach(row => {
        const sourceRowId = String(row.sourceRowId ?? row.rowId ?? row.rowNumber ?? "").trim();
        const excluded = row.excluded === true || row.action === "exclude" || row.resolution === "exclude";
        const rawProductId = row.productId === null || row.productId === undefined || row.productId === "" ? null : Number(row.productId);
        const productId = Number.isInteger(rawProductId) && rawProductId > 0 ? rawProductId : null;
        const identityState = productId ? "existing" : (row.isNew === true ? "new" : "unresolved");
        const hasSourceIdentity = Boolean(sourceRowId);
        const targetMat = normalizeMatCode(row.targetMat ?? row.externalId ?? row.external_id);
        const item = {
            sourceRowId,
            productId,
            identityState,
            hasSourceIdentity,
            isNew: identityState === "new",
            oldMat: productId && productById.get(productId) ? productById.get(productId).oldMat : "",
            targetMat,
            action: excluded ? "excluded" : identityState,
            resolution: row.resolution || row.action || null,
            dependencies: []
        };
        items.push(item);
        if (excluded) return;
        const ambiguous = Array.isArray(row.candidates) && row.candidates.length !== 1;
        if (ambiguous) {
            conflicts.push(conflict("AMBIGUOUS_IDENTITY", {
                sourceRowId,
                candidateIds: row.candidates.map(candidate => Number(candidate.id)).filter(Number.isInteger)
            }));
        } else if (identityState === "unresolved") {
            conflicts.push(conflict(hasSourceIdentity ? "UNRESOLVED_IDENTITY" : "MISSING_SOURCE_IDENTITY", { sourceRowId }));
        }
        if (!hasSourceIdentity && identityState === "new") {
            conflicts.push(conflict("MISSING_SOURCE_IDENTITY", { sourceRowId }));
        }
        if (productId && row.isNew === true) {
            conflicts.push(conflict("CONFLICTING_IDENTITY_FLAGS", { sourceRowId, productId }));
        }
        if (identityState === "existing" && !productById.has(productId)) {
            conflicts.push(conflict("UNKNOWN_PRODUCT_ID", { sourceRowId, productId }));
        }
        if (!validateMatCode(targetMat)) conflicts.push(conflict("INVALID_TARGET_MAT", { sourceRowId, targetMat }));
        if (identityState === "existing") {
            const previous = itemByProductId.get(productId);
            if (previous) {
                conflicts.push(conflict("DUPLICATE_PRODUCT_TARGET", { sourceRowIds: [previous.sourceRowId, sourceRowId], productId }));
            } else {
                itemByProductId.set(productId, item);
            }
        }
        if (identityState !== "unresolved" && targetMat && (identityState !== "new" || hasSourceIdentity)) {
            const targetItems = itemByTargetMat.get(targetMat) || [];
            targetItems.push(item);
            itemByTargetMat.set(targetMat, targetItems);
        }
    });

    itemByTargetMat.forEach((targetItems, mat) => {
        targetItems.sort((left, right) => compareIds(left.sourceRowId, right.sourceRowId) || compareIds(identityKey(left), identityKey(right)) || compareIds(left.targetMat, right.targetMat));
        if (targetItems.length > 1) conflicts.push(conflict("DUPLICATE_TARGET_MAT", { mat, sourceRowIds: targetItems.map(item => item.sourceRowId) }));
    });
    const selectedTargetItems = new Set(Array.from(itemByTargetMat.values()).map(targetItems => targetItems[0]));

    const participatingIds = new Set(itemByProductId.keys());
    itemByTargetMat.forEach((targetItems, mat) => {
        const owner = ownerByMat.get(mat);
        if (!owner || participatingIds.has(owner.id)) return;
        targetItems.forEach(item => conflicts.push(conflict("TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT", {
            mat, ownerProductId: owner.id, requestingProductId: item.productId, sourceRowId: item.sourceRowId
        })));
    });

    const finalOwners = new Map();
    productById.forEach(product => { if (product.oldMat) finalOwners.set(product.oldMat, product.id); });
    items.forEach(item => {
        if (item.action === "excluded" || item.identityState === "unresolved" || !item.targetMat || (item.identityState === "new" && !item.hasSourceIdentity)) return;
        if (!selectedTargetItems.has(item)) return;
        const currentTargetOwner = ownerByMat.get(item.targetMat);
        if (currentTargetOwner && !participatingIds.has(currentTargetOwner.id)) return;
        if (item.identityState === "existing") {
            if (item.oldMat && finalOwners.get(item.oldMat) === item.productId) finalOwners.delete(item.oldMat);
            finalOwners.set(item.targetMat, item.productId);
        } else {
            finalOwners.set(item.targetMat, `new:${item.sourceRowId}`);
        }
    });

    const reassignments = items.filter(item => item.identityState === "existing" && item.action !== "excluded" && item.oldMat !== item.targetMat);
    reassignments.forEach(item => { item.action = "reassign"; });

    const nodeByIdentity = new Map();
    items.filter(item => item.action !== "excluded" && item.identityState !== "unresolved" && (item.identityState !== "new" || item.hasSourceIdentity)).forEach(item => nodeByIdentity.set(identityKey(item), item));
    const edges = [];
    const addEdge = (from, to, mat) => {
        if (!from || !to || from === to) return;
        if (!edges.some(edge => edge.from === from && edge.to === to && edge.mat === mat)) edges.push({ from, to, mat });
    };
    reassignments.forEach(item => {
        const owner = ownerByMat.get(item.targetMat);
        if (owner && participatingIds.has(owner.id)) addEdge(identityKey(item), `product:${owner.id}`, item.targetMat);
    });
    items.filter(item => item.identityState === "new" && item.hasSourceIdentity && item.action !== "excluded").forEach(item => {
        const owner = ownerByMat.get(item.targetMat);
        if (owner && participatingIds.has(owner.id)) addEdge(identityKey(item), `product:${owner.id}`, item.targetMat);
    });
    edges.forEach(edge => { const item = nodeByIdentity.get(edge.from); if (item) item.dependencies.push(edge.to); });
    items.forEach(item => { item.dependencies = Array.from(new Set(item.dependencies)).sort(compareIds); });

    const adjacency = new Map();
    edges.forEach(edge => {
        if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
        if (!adjacency.has(edge.to)) adjacency.set(edge.to, new Set());
        adjacency.get(edge.from).add(edge.to);
        adjacency.get(edge.to).add(edge.from);
    });
    const dependencyGroups = [];
    const visited = new Set();
    Array.from(adjacency.keys()).sort(compareIds).forEach(start => {
        if (visited.has(start)) return;
        const component = [];
        const queue = [start];
        visited.add(start);
        while (queue.length) {
            const current = queue.shift();
            component.push(current);
            Array.from(adjacency.get(current) || []).sort(compareIds).forEach(next => {
                if (!visited.has(next)) { visited.add(next); queue.push(next); }
            });
        }
        const componentEdges = edges.filter(edge => component.includes(edge.from) && component.includes(edge.to))
            .sort((left, right) => compareIds(left.from, right.from) || compareIds(left.to, right.to) || compareIds(left.mat, right.mat));
        const members = component.map(identity => nodeByIdentity.get(identity)).filter(Boolean).sort((left, right) => compareIds(identityKey(left), identityKey(right)));
        dependencyGroups.push({
            identities: component.sort(compareIds),
            productIds: members.filter(item => item.productId).map(item => item.productId).sort((a, b) => a - b),
            sourceRowIds: members.map(item => item.sourceRowId).sort(compareIds),
            edges: componentEdges,
            kind: componentEdges.length >= component.length && component.length > 1 ? "cycle_or_swap" : "chain"
        });
    });

    const uniqueConflicts = Array.from(new Map(conflicts.map(item => [JSON.stringify(canonicalize(item)), canonicalize(item)])).values())
        .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    const valid = uniqueConflicts.length === 0;
    return {
        valid,
        items: items.sort((left, right) => compareIds(left.sourceRowId, right.sourceRowId) || compareIds(identityKey(left), identityKey(right)) || compareIds(left.targetMat, right.targetMat)),
        reassignments: reassignments.sort((left, right) => left.productId - right.productId),
        conflicts: uniqueConflicts,
        dependencyGroups: dependencyGroups.sort((left, right) => compareIds(left.identities[0], right.identities[0])),
        // Diagnostic/proposed state only. It is not apply-authoritative when valid is false.
        finalOwnerByMat: Object.fromEntries(Array.from(finalOwners.entries()).sort(([left], [right]) => compareIds(left, right))),
        summary: {
            itemCount: items.length,
            reassignmentCount: reassignments.length,
            newCount: items.filter(item => item.identityState === "new" && item.hasSourceIdentity && item.action !== "excluded").length,
            excludedCount: items.filter(item => item.action === "excluded").length,
            conflictCount: uniqueConflicts.length,
            valid
        }
    };
}

module.exports = { normalizeMatCode, validateMatCode, planMatReassignments };
