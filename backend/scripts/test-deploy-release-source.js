const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const deployScript = path.join(projectRoot, "deploy", "scripts", "deploy-release.sh");

function resolveBash() {
    if (process.platform !== "win32") return "bash";
    const candidates = [
        path.join(process.env.ProgramFiles || "C:\\Program Files", "Git", "bin", "bash.exe"),
        path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Git", "bin", "bash.exe")
    ];
    return candidates.find(candidate => fs.existsSync(candidate));
}

const bash = resolveBash();
assert(bash, "Bash is required to test deploy source selection.");

function toBashPath(value) {
    if (process.platform !== "win32") return value;
    const cygpath = path.join(path.dirname(path.dirname(bash)), "usr", "bin", "cygpath.exe");
    const result = spawnSync(cygpath, ["-u", value], { encoding: "utf8" });
    assert.strictEqual(result.status, 0, result.stderr || "Could not convert path: " + value);
    return result.stdout.trim();
}

function runBash(script, args = []) {
    const result = spawnSync(bash, ["--noprofile", "--norc", "-c", script, "test", ...args], {
        encoding: "utf8",
        windowsHide: true
    });
    return { ...result, stdout: result.stdout || "", stderr: result.stderr || "" };
}

function git(cwd, args) {
    const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
    return result.stdout.trim();
}

function createRepo(root, folder, content) {
    const repo = path.join(root, folder);
    fs.mkdirSync(repo, { recursive: true });
    git(repo, ["init", "-q"]);
    git(repo, ["config", "user.name", "MatMix deploy test"]);
    git(repo, ["config", "user.email", "deploy-test@example.invalid"]);
    fs.writeFileSync(path.join(repo, "archive-origin.txt"), content);
    git(repo, ["add", "archive-origin.txt"]);
    git(repo, ["commit", "-q", "-m", "fixture"]);
    return { path: repo, commit: git(repo, ["rev-parse", "HEAD"]) };
}

function sourceScript() {
    return 'source "$1"; REPO="$2";';
}

function repositoryStatus(repo) {
    return git(repo, ["status", "--porcelain"]);
}

function fileSha256(file) {
    return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-deploy-source-"));
    try {
        const syntax = spawnSync(bash, ["-n", toBashPath(deployScript)], {
            encoding: "utf8",
            windowsHide: true
        });
        assert.strictEqual(syntax.status, 0, syntax.stderr);

        const defaultRepo = createRepo(root, "default-source", "default-repository-bytes\n");
        const explicitRepo = createRepo(root, "selected-source", "selected-repository-bytes\n");
        const scriptPath = toBashPath(deployScript);
        const defaultPath = toBashPath(defaultRepo.path);
        const explicitPath = toBashPath(explicitRepo.path);

        const defaultBefore = repositoryStatus(defaultRepo.path);
        const defaultCommit = git(defaultRepo.path, ["rev-parse", "HEAD"]);
        const defaultResult = runBash(
            sourceScript() + ' parse_deploy_args "$3" && canonicalize_source_repo && ensure_source_repo_clean && [[ "$SOURCE_REPO" == "$(realpath -e -- "$2")" ]] && [[ "$(resolve_source_commit)" == "$3" ]]',
            [scriptPath, defaultPath, defaultRepo.commit]
        );
        assert.strictEqual(defaultResult.status, 0, defaultResult.stderr || defaultResult.stdout);
        assert.strictEqual(defaultResult.stderr, "");
        assert.strictEqual(repositoryStatus(defaultRepo.path), defaultBefore);
        assert.strictEqual(git(defaultRepo.path, ["rev-parse", "HEAD"]), defaultCommit);

        fs.writeFileSync(path.join(defaultRepo.path, "unrelated-dirty.txt"), "must remain untouched\n");
        const dirtyDefaultStatus = repositoryStatus(defaultRepo.path);
        const dirtyDefaultHead = git(defaultRepo.path, ["rev-parse", "HEAD"]);
        const dirtyDefaultResult = runBash(
            sourceScript() + ' parse_deploy_args "$3" && canonicalize_source_repo && ensure_source_repo_clean',
            [scriptPath, defaultPath, defaultRepo.commit]
        );
        assert.notStrictEqual(dirtyDefaultResult.status, 0, "The default source must retain its clean-worktree guard.");
        assert.strictEqual(repositoryStatus(defaultRepo.path), dirtyDefaultStatus);
        const explicitIndexSha = fileSha256(path.join(explicitRepo.path, ".git", "index"));
        const explicitBefore = repositoryStatus(explicitRepo.path);
        const explicitHead = git(explicitRepo.path, ["rev-parse", "HEAD"]);
        const archivePath = path.join(root, "selected-source.tar");
        const explicitResult = runBash(
            sourceScript() + ' parse_deploy_args --source-repo "$3" "$4" && canonicalize_source_repo && ensure_source_repo_clean && RESOLVED_COMMIT="$(resolve_source_commit)" && [[ "$RESOLVED_COMMIT" == "$4" ]] && archive_source_commit "$RESOLVED_COMMIT" > "$5"',
            [scriptPath, defaultPath, explicitPath, explicitRepo.commit, toBashPath(archivePath)]
        );
        assert.strictEqual(explicitResult.status, 0, explicitResult.stderr || explicitResult.stdout);
        assert.strictEqual(repositoryStatus(defaultRepo.path), dirtyDefaultStatus);
        assert.strictEqual(git(defaultRepo.path, ["rev-parse", "HEAD"]), dirtyDefaultHead);
        assert.strictEqual(repositoryStatus(explicitRepo.path), explicitBefore);
        assert.strictEqual(git(explicitRepo.path, ["rev-parse", "HEAD"]), explicitHead);
        assert.strictEqual(fileSha256(path.join(explicitRepo.path, ".git", "index")), explicitIndexSha);

        const extracted = path.join(root, "archive-extracted");
        fs.mkdirSync(extracted);
        const tarResult = runBash('tar -x -f "$1" -C "$2"', [toBashPath(archivePath), toBashPath(extracted)]);
        assert.strictEqual(tarResult.status, 0, tarResult.stderr);
        assert.strictEqual(
            fs.readFileSync(path.join(extracted, "archive-origin.txt"), "utf8").trimEnd(),
            "selected-repository-bytes"
        );

        fs.writeFileSync(path.join(explicitRepo.path, "dirty.txt"), "dirty\n");
        const dirtyStatus = repositoryStatus(explicitRepo.path);
        const dirtyResult = runBash(
            sourceScript() + ' parse_deploy_args --source-repo "$3" "$4" && canonicalize_source_repo && ensure_source_repo_clean',
            [scriptPath, defaultPath, explicitPath, explicitRepo.commit]
        );
        assert.notStrictEqual(dirtyResult.status, 0, "A dirty explicit source repository must be rejected.");
        assert.strictEqual(repositoryStatus(explicitRepo.path), dirtyStatus);

        const invalidRepo = path.join(root, "not-a-repository");
        fs.mkdirSync(invalidRepo);
        const invalidRepoResult = runBash(
            sourceScript() + ' parse_deploy_args --source-repo "$3" "$4" && canonicalize_source_repo',
            [scriptPath, defaultPath, toBashPath(invalidRepo), defaultRepo.commit]
        );
        assert.notStrictEqual(invalidRepoResult.status, 0, "A source without .git must be rejected.");

        const absentCommitResult = runBash(
            sourceScript() + ' parse_deploy_args --source-repo "$3" "$4" && canonicalize_source_repo && resolve_source_commit',
            [scriptPath, defaultPath, explicitPath, "0123456789abcdef0123456789abcdef01234567"]
        );
        assert.notStrictEqual(absentCommitResult.status, 0, "A target commit absent from source must be rejected.");

        const invalidArgCases = [
            [],
            ["--source-repo"],
            ["--source-repo", explicitPath],
            ["--source-repo", "", explicitRepo.commit],
            ["--source-repo", explicitPath, ""],
            ["--source-repo", explicitPath, explicitRepo.commit, "extra"],
            ["--source-repo", explicitPath, "--source-repo", explicitRepo.commit],
            [explicitRepo.commit, "--source-repo", explicitPath]
        ];
        for (const args of invalidArgCases) {
            const result = runBash(
                sourceScript() + ' parse_deploy_args "\${@:3}"',
                [scriptPath, defaultPath, ...args]
            );
            assert.notStrictEqual(result.status, 0, "Ambiguous arguments were accepted: " + args.join(" "));
        }

        console.log("PASS deploy source selection: default, explicit clean source, dirty/invalid rejection, commit validation, archive origin, argument parsing, source immutability");
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

main();
