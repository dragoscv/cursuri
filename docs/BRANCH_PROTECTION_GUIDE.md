# Branch Protection Rules Configuration Guide

## 📋 Task 20: Configure Branch Protection Rules

**Status**: Requires Manual Configuration
**Estimated Time**: 10 minutes
**Priority**: HIGH (Security & Code Quality)

---

## 🎯 Objective

Configure branch protection rules for the `main` branch to enforce:

1. Pull request workflow (no direct pushes)
2. CI status checks must pass before merge
3. Code review requirements
4. Prevent force pushes and deletions

---

## 🔧 Configuration Steps

### Step 1: Navigate to Repository Settings

1. Go to: https://github.com/YOUR_USERNAME/cursuri
2. Click **Settings** tab (top-right, near "Insights")
3. Click **Branches** in left sidebar (under "Code and automation")

### Step 2: Add Branch Protection Rule

1. Click **Add rule** or **Add branch protection rule**
2. In "Branch name pattern" field, enter: `main`

### Step 3: Configure Protection Settings

#### ✅ Required Settings:

**Protect matching branches:**

- [ ] **Require a pull request before merging**
  - [ ] Require approvals: **1** (adjust based on team size)
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (optional, if CODEOWNERS file exists)

- [ ] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date before merging
  - **Add required status checks** (search and select):
    - `test` (from ci.yml workflow)
    - `security` (Snyk scan from ci.yml workflow)
    - `type-check` (TypeScript validation)
    - `lint` (ESLint validation)
    - `build` (Next.js build)

- [ ] **Require conversation resolution before merging**
  - Ensures all PR comments are resolved before merge

- [ ] **Require signed commits** (optional but recommended)

- [ ] **Require linear history** (optional, prevents merge commits)

- [ ] **Do not allow bypassing the above settings**
  - Applies rules to administrators too

**Rules applied to everyone including administrators:**

- [ ] **Allow force pushes**: **DISABLED** ❌
  - Prevents rewriting history

- [ ] **Allow deletions**: **DISABLED** ❌
  - Prevents accidental branch deletion

### Step 4: Save Changes

1. Scroll to bottom of page
2. Click **Create** button
3. Verify rule appears in "Branch protection rules" list

---

## 🔍 Verification Steps

### Test 1: Direct Push Prevention

```powershell
# Try to push directly to main (should fail)
git checkout main
git commit --allow-empty -m "Test: direct push to main"
git push origin main
```

**Expected Result**: ❌ Push rejected with message:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

### Test 2: Pull Request Workflow

```powershell
# Create feature branch
git checkout -b test/branch-protection
git commit --allow-empty -m "Test: PR workflow"
git push origin test/branch-protection

# Create PR via GitHub UI
# Verify: Cannot merge until CI passes and reviews are approved
```

**Expected Result**: ✅ PR created, but merge button disabled until:

- All CI checks pass (green checkmarks)
- Required reviews approved
- All conversations resolved

### Test 3: Failing CI Blocks Merge

```powershell
# Create branch with intentional error
git checkout -b test/failing-ci
# Add file with TypeScript error
echo "const x: number = 'string';" > test-error.ts
git add test-error.ts
# Pre-commit hook will fix formatting, but TypeScript error remains
git commit -m "Test: intentional TypeScript error"
git push origin test/failing-ci

# Create PR via GitHub UI
```

**Expected Result**: ❌ CI fails, PR cannot be merged:

- Red X next to "test" check
- Merge button disabled
- Message: "Required status checks have not passed"

---

## 📊 What This Protects Against

| Threat                           | Protection                       | Benefit                       |
| -------------------------------- | -------------------------------- | ----------------------------- |
| Accidental direct pushes to main | Require PR workflow              | All changes go through review |
| Breaking changes                 | CI must pass before merge        | Production stays stable       |
| Unreviewed code                  | Require approvals                | Code quality maintained       |
| Unresolved issues                | Conversation resolution required | All feedback addressed        |
| History rewriting                | Disable force push               | Audit trail preserved         |
| Branch deletion                  | Disable deletion                 | Critical branches protected   |

---

## 🚀 Team Workflow Impact

### New Developer Workflow:

1. **Clone repository**

   ```powershell
   git clone https://github.com/YOUR_USERNAME/cursuri.git
   cd cursuri
   npm install  # Installs Husky pre-commit hooks automatically
   ```

2. **Create feature branch**

   ```powershell
   git checkout -b feature/new-feature
   ```

3. **Make changes and commit**

   ```powershell
   # Write code
   git add .
   git commit -m "feat: add new feature"
   # Pre-commit hook runs: ESLint + Prettier
   # Commit succeeds only if code quality checks pass
   ```

4. **Push to GitHub**

   ```powershell
   git push origin feature/new-feature
   ```

5. **Create Pull Request**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Fill out PR template (if configured)
   - Submit for review

6. **CI runs automatically**
   - Type-check
   - Lint
   - Tests
   - Build
   - Security scan

7. **Code review**
   - Team member reviews code
   - Provides feedback
   - Approves when satisfied

8. **Merge**
   - All CI checks passed ✅
   - All reviews approved ✅
   - All conversations resolved ✅
   - Click "Merge pull request"
   - Deployment workflow triggers automatically (deploy.yml)

---

## 🔐 Security Benefits

1. **Prevents Unauthorized Changes**
   - Only reviewed code enters production
   - Audit trail of all changes via PRs

2. **Enforces Quality Gates**
   - Code must pass all tests before merge
   - Security vulnerabilities caught by Snyk

3. **Maintains Stability**
   - Breaking changes detected before merge
   - TypeScript errors prevent deployment

4. **Protects Against Accidents**
   - Cannot accidentally delete main branch
   - Cannot accidentally force push and lose history

---

## 📝 Additional Configuration (Optional)

### Advanced Settings:

1. **CODEOWNERS File** (`.github/CODEOWNERS`)

   ```
   # Require specific team members to review certain files
   *.tsx @frontend-team
   *.ts @backend-team
   /app/api/* @api-team
   /components/Admin/* @admin-team
   ```

2. **Auto-merge** (GitHub Actions)

   ```yaml
   # .github/workflows/auto-merge.yml
   # Auto-merge dependabot PRs after CI passes
   ```

3. **Auto-delete Branch**
   - Repository Settings → General → "Automatically delete head branches"
   - Cleans up merged branches automatically

4. **Status Check Timeout**
   - Set maximum time for CI to complete
   - Default: 30 minutes (adjust if needed)

---

## 🎯 Success Criteria

- ✅ Branch protection rule created for `main` branch
- ✅ Require PR before merge enabled
- ✅ Require status checks enabled (all CI jobs listed)
- ✅ Require conversation resolution enabled
- ✅ Force push disabled
- ✅ Branch deletion disabled
- ✅ Verification tests pass:
  - Direct push to main rejected
  - PR workflow works
  - Failing CI blocks merge
  - Passing CI allows merge

---

## 🚨 Troubleshooting

### Issue: Status checks not appearing

**Solution**:

1. Push to test branch to trigger CI
2. Wait for CI to complete
3. Return to branch protection settings
4. Search for status check names again

### Issue: Cannot find "test" status check

**Solution**:

- Status checks only appear after running at least once
- Push any branch to trigger ci.yml workflow first
- Then configure branch protection

### Issue: Administrators can still push directly

**Solution**:

- Enable "Do not allow bypassing the above settings"
- Ensure "Include administrators" is checked

### Issue: Old commits bypass pre-commit hooks

**Solution**:

- Pre-commit hooks only work for new commits
- CI workflow catches issues from old commits
- Consider: `git rebase` to reapply commits with hooks

---

## 📚 References

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [CODEOWNERS File](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

## ✅ Completion Checklist

Before marking Task 20 complete, verify:

- [ ] Navigated to GitHub repository settings
- [ ] Created branch protection rule for `main` branch
- [ ] Enabled "Require a pull request before merging"
- [ ] Enabled "Require status checks to pass before merging"
- [ ] Added all CI status checks (test, security, type-check, lint, build)
- [ ] Enabled "Require conversation resolution before merging"
- [ ] Disabled "Allow force pushes"
- [ ] Disabled "Allow deletions"
- [ ] Saved branch protection rule
- [ ] Tested: Direct push to main rejected
- [ ] Tested: PR workflow works
- [ ] Tested: Failing CI blocks merge
- [ ] Documented completion in task list

**Estimated Time to Complete**: 10 minutes

---

**Document Status**: Ready for Implementation
**Created By**: GitHub Copilot Agent
**Part of**: Week 2 Day 2 - CI/CD Infrastructure Setup
