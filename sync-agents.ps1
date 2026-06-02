# Run from repo root

$root = (Get-Location).Path
$agents = Join-Path $root ".agents\skills"
$plans  = Join-Path $root ".agents\plans"

function Test-ReparsePoint($path) {
    if (-not (Test-Path -LiteralPath $path)) { return $false }
    return [bool]((Get-Item -LiteralPath $path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)
}

function Remove-ExistingAlias($path) {
    if (-not (Test-Path -LiteralPath $path)) { return }

    $item = Get-Item -LiteralPath $path -Force

    if ($item.PSIsContainer) {
        if (-not (Test-ReparsePoint $path)) {
            throw "Refusing to replace real directory '$path'. Restore it manually or convert it to a link first."
        }

        Remove-Item -LiteralPath $path -Recurse -Force
        return
    }

    if ($item.LinkType -or (Test-ReparsePoint $path)) {
        Remove-Item -LiteralPath $path -Force
        return
    }

    throw "Refusing to replace real file '$path'. Restore it manually or convert it to a link first."
}

function New-FileLink($link, $target) {
    Remove-ExistingAlias $link
    New-Item -ItemType SymbolicLink -Path $link -Target $target | Out-Null
}

function New-DirectoryLink($link, $target) {
    Remove-ExistingAlias $link

    try {
        New-Item -ItemType SymbolicLink -Path $link -Target $target | Out-Null
    } catch {
        New-Item -ItemType Junction -Path $link -Target $target | Out-Null
    }
}

New-Item -ItemType Directory -Force -Path ".\.agents\skills" | Out-Null
New-Item -ItemType Directory -Force -Path ".\.agents\plans"  | Out-Null

New-FileLink ".\AGENTS.md" ".\AGENT.md"
New-FileLink ".\CLAUDE.md" ".\AGENT.md"
New-FileLink ".\GEMINI.md" ".\AGENT.md"

New-DirectoryLink ".\.opencode\skills" $agents
New-DirectoryLink ".\.claude\skills" $agents
New-DirectoryLink ".\.gemini\skills" $agents

New-DirectoryLink ".\.opencode\plans" $plans
New-DirectoryLink ".\.claude\plans" $plans
New-DirectoryLink ".\.gemini\plans" $plans

Get-ChildItem -Recurse -Filter "AGENT.md" | ForEach-Object {
    $dir = $_.DirectoryName

    New-FileLink (Join-Path $dir "AGENTS.md") $_.FullName
    New-FileLink (Join-Path $dir "CLAUDE.md") $_.FullName
    New-FileLink (Join-Path $dir "GEMINI.md") $_.FullName
}

$appDirs = @("apps\api", "apps\web", "apps\mobile")

foreach ($app in $appDirs) {
    $full = Join-Path $root $app
    if (-not (Test-Path $full)) { continue }

    New-DirectoryLink (Join-Path $full ".opencode\skills") $agents
    New-DirectoryLink (Join-Path $full ".claude\skills") $agents
    New-DirectoryLink (Join-Path $full ".gemini\skills") $agents

    New-DirectoryLink (Join-Path $full ".opencode\plans") $plans
    New-DirectoryLink (Join-Path $full ".claude\plans") $plans
    New-DirectoryLink (Join-Path $full ".gemini\plans") $plans
}

Write-Host "[OK] Repo normalized"
