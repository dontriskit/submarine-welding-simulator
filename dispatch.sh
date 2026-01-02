#!/bin/bash
# DISPATCH.SH - Control all 3 Claude Code terminals from one CLI
# Uses git worktrees for parallel development without branch conflicts
# FIX PHASE: Uses GitHub issues for task tracking
# Usage: ./dispatch.sh <command> [args]

# ============================================================
# SEPARATE DIRECTORIES FOR EACH ROLE (git worktrees)
# ============================================================
DIR_MAIN="/home/mhm/Documents/submarine-welding-simulator"      # SUPERVISOR - main branch
DIR_CODER_A="/home/mhm/Documents/submarine-coder-a"             # CODER-A - dev/coder-a branch
DIR_CODER_B="/home/mhm/Documents/submarine-coder-b"             # CODER-B - dev/coder-b branch

QUEUE_DIR="$DIR_MAIN/TASK-QUEUE"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ts() { date "+%Y-%m-%d %H:%M"; }

# ============================================================
# AGENT PROMPTS - FIX PHASE with GitHub Issues
# ============================================================

PROMPT_CODER_A='You are CODER-A fixing the submarine welding simulator.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-coder-a
YOUR BRANCH: dev/coder-a (already checked out - DO NOT switch branches)

PROBLEM: Screen is dark because CameraManager.render() only renders to textures, not the canvas.

FIRST, read these files:
1. @TASK-QUEUE/queue-coder-a.md - Your fix tasks with GitHub issue numbers
2. @COLLABORATION-RULES.md - Commit format

YOUR GITHUB ISSUES (label: coder-a):
- #3 FIX-A1: Add main canvas render pass to CameraManager.ts
- #4 FIX-A2: Add main camera selection methods
- #5 FIX-A3: Camera switching with Tab key
- #6 FIX-A4: Debug logging
- #7 FIX-A5: Verify input integration
- #8 FIX-A6: Fix welding activation

WORKFLOW:
1. Run `gh issue list --label coder-a` to see open issues
2. Start with Phase 1 (#3, #4, #6) - get submarine visible
3. Implement fix, test with `npm run dev`
4. Commit: [FIX-A#] description
5. Close issue: `gh issue close #`
6. Push to dev/coder-a

YOUR FILES: src/cameras/CameraManager.ts, src/App.ts
CRITICAL FIX: Add `this.renderer.setRenderTarget(null); this.renderer.render(scene, mainCamera);` after viewport loop'

PROMPT_CODER_B='You are CODER-B fixing the submarine welding simulator.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-coder-b
YOUR BRANCH: dev/coder-b (already checked out - DO NOT switch branches)

PROBLEM: Scene has no visible content (dark) - needs seafloor, lighting, and viewport display.

FIRST, read these files:
1. @TASK-QUEUE/queue-coder-b.md - Your fix tasks with GitHub issue numbers
2. @COLLABORATION-RULES.md - Commit format

YOUR GITHUB ISSUES (label: coder-b):
- #9 FIX-B1: Create ViewportDisplay component
- #10 FIX-B2: Wire viewport displays to UI
- #11 FIX-B3: Add seafloor plane
- #12 FIX-B4: Add pipe structure
- #13 FIX-B5: Boost lighting
- #14 FIX-B6: Enhance submarine lights

WORKFLOW:
1. Run `gh issue list --label coder-b` to see open issues
2. Start with Phase 1 (#11, #13) - add visible content
3. Implement fix, test with `npm run dev`
4. Commit: [FIX-B#] description
5. Close issue: `gh issue close #`
6. Push to dev/coder-b

YOUR FILES: src/environment/UnderwaterEnv.ts, src/entities/Submarine.ts, src/ui/*'

PROMPT_SUPERVISOR='You are SUPERVISOR coordinating the fix phase.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-welding-simulator
YOUR BRANCH: main (DO NOT switch branches)

CURRENT ISSUE: Dark screen - all code exists but nothing renders.

READ:
1. @TASK-QUEUE/queue-supervisor.md - Status
2. @COLLABORATION-RULES.md - Merge rules

GITHUB ISSUES:
- CODER-A: #3,#4,#5,#6,#7,#8 (rendering core)
- CODER-B: #9,#10,#11,#12,#13,#14 (scene/UI)

Run `gh issue list` to see all open issues.

WORKFLOW:
1. Monitor issue progress
2. When fixes ready, merge CODER-A first, then CODER-B
3. Test: npm run dev - should see submarine
4. Close issues as merged

SUCCESS: Submarine visible, WASD moves, Numpad 0 welds'

case "$1" in
    # ============================================================
    # SETUP
    # ============================================================
    setup)
        echo -e "${GREEN}Setting up git worktrees...${NC}"
        cd "$DIR_MAIN"

        if [ ! -d "$DIR_CODER_A" ]; then
            git worktree add "$DIR_CODER_A" dev/coder-a
            echo -e "${GREEN}Created: $DIR_CODER_A (dev/coder-a)${NC}"
        else
            echo -e "${YELLOW}Exists: $DIR_CODER_A${NC}"
        fi

        if [ ! -d "$DIR_CODER_B" ]; then
            git worktree add "$DIR_CODER_B" dev/coder-b
            echo -e "${GREEN}Created: $DIR_CODER_B (dev/coder-b)${NC}"
        else
            echo -e "${YELLOW}Exists: $DIR_CODER_B${NC}"
        fi

        echo ""
        git worktree list
        ;;

    worktrees)
        cd "$DIR_MAIN" && git worktree list
        ;;

    # ============================================================
    # TESTING
    # ============================================================
    test)
        echo -e "${GREEN}Starting dev server...${NC}"
        cd "$DIR_MAIN"
        npm run dev &
        sleep 2
        xdg-open "http://localhost:5173" 2>/dev/null || open "http://localhost:5173" 2>/dev/null || echo "Open http://localhost:5173"
        ;;

    verify)
        echo -e "${GREEN}Verifying TypeScript...${NC}"
        cd "$DIR_MAIN"
        npx tsc --noEmit
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}TypeScript OK${NC}"
        else
            echo -e "${RED}TypeScript errors found${NC}"
        fi
        ;;

    build)
        echo -e "${GREEN}Building...${NC}"
        cd "$DIR_MAIN"
        npm run build
        ;;

    # ============================================================
    # GITHUB ISSUES
    # ============================================================
    issues)
        echo -e "${GREEN}=== All Open Fix Issues ===${NC}"
        cd "$DIR_MAIN"
        gh issue list --state open
        ;;

    issues-a)
        echo -e "${CYAN}=== CODER-A Issues ===${NC}"
        cd "$DIR_MAIN"
        gh issue list --label coder-a
        ;;

    issues-b)
        echo -e "${CYAN}=== CODER-B Issues ===${NC}"
        cd "$DIR_MAIN"
        gh issue list --label coder-b
        ;;

    close)
        [ -z "$2" ] && echo "Usage: $0 close <issue#>" && exit 1
        cd "$DIR_MAIN"
        gh issue close "$2"
        echo -e "${GREEN}Closed issue #$2${NC}"
        ;;

    # ============================================================
    # LAUNCH
    # ============================================================
    start-all)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  FIX PHASE - Dark Screen Bug${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${CYAN}GitHub Issues:${NC}"
        cd "$DIR_MAIN" && gh issue list --state open | head -15
        echo ""
        echo -e "${CYAN}Terminal 1 - CODER-A (rendering fixes):${NC}"
        echo -e "  ${YELLOW}cd $DIR_CODER_A${NC}"
        echo '  claude "You are CODER-A. Read @TASK-QUEUE/queue-coder-a.md. Fix issues #3,#4,#6 first (Phase 1). Your branch is dev/coder-a."'
        echo ""
        echo -e "${CYAN}Terminal 2 - CODER-B (scene/UI fixes):${NC}"
        echo -e "  ${YELLOW}cd $DIR_CODER_B${NC}"
        echo '  claude "You are CODER-B. Read @TASK-QUEUE/queue-coder-b.md. Fix issues #11,#13 first (Phase 1). Your branch is dev/coder-b."'
        echo ""
        echo -e "${CYAN}Terminal 3 - SUPERVISOR:${NC}"
        echo -e "  ${YELLOW}cd $DIR_MAIN${NC}"
        echo '  claude "You are SUPERVISOR. Run gh issue list. Merge when fixes ready. Test with npm run dev."'
        echo ""
        echo -e "${GREEN}Or use: ./dispatch.sh start-a | start-b | start-super${NC}"
        ;;

    start-a)
        echo -e "${CYAN}Launching CODER-A in $DIR_CODER_A${NC}"
        cd "$DIR_CODER_A"
        claude "$PROMPT_CODER_A"
        ;;

    start-b)
        echo -e "${CYAN}Launching CODER-B in $DIR_CODER_B${NC}"
        cd "$DIR_CODER_B"
        claude "$PROMPT_CODER_B"
        ;;

    start-super)
        echo -e "${CYAN}Launching SUPERVISOR in $DIR_MAIN${NC}"
        cd "$DIR_MAIN"
        claude "$PROMPT_SUPERVISOR"
        ;;

    # Quick tasks
    task-a)
        [ -z "$2" ] && echo "Usage: $0 task-a \"task\"" && exit 1
        cd "$DIR_CODER_A"
        claude "You are CODER-A in $DIR_CODER_A (dev/coder-a). Read @COLLABORATION-RULES.md. Task: $2. Commit as [FIX-A#]."
        ;;

    task-b)
        [ -z "$2" ] && echo "Usage: $0 task-b \"task\"" && exit 1
        cd "$DIR_CODER_B"
        claude "You are CODER-B in $DIR_CODER_B (dev/coder-b). Read @COLLABORATION-RULES.md. Task: $2. Commit as [FIX-B#]."
        ;;

    task-super)
        [ -z "$2" ] && echo "Usage: $0 task-super \"task\"" && exit 1
        cd "$DIR_MAIN"
        claude "You are SUPERVISOR in $DIR_MAIN (main). Read @COLLABORATION-RULES.md. Task: $2"
        ;;

    # ============================================================
    # CONTINUE (lost context)
    # ============================================================
    continue-a)
        cd "$DIR_CODER_A"
        claude "You are CODER-A in $DIR_CODER_A (dev/coder-a). Run gh issue list --label coder-a. Fix next open issue."
        ;;

    continue-b)
        cd "$DIR_CODER_B"
        claude "You are CODER-B in $DIR_CODER_B (dev/coder-b). Run gh issue list --label coder-b. Fix next open issue."
        ;;

    continue-super)
        cd "$DIR_MAIN"
        claude "You are SUPERVISOR in $DIR_MAIN (main). Run gh issue list. Merge if ready, test with npm run dev."
        ;;

    # ============================================================
    # STATUS
    # ============================================================
    status)
        echo -e "${GREEN}=== FIX PHASE STATUS ===${NC}"
        echo ""
        echo -e "${CYAN}Open Issues:${NC}"
        cd "$DIR_MAIN" && gh issue list --state open 2>/dev/null || echo "  (run gh auth login)"
        echo ""
        echo -e "${CYAN}Worktrees:${NC}"
        cd "$DIR_MAIN" && git worktree list
        echo ""
        echo -e "${CYAN}Recent Commits:${NC}"
        echo -e "${YELLOW}CODER-A:${NC}"
        cd "$DIR_CODER_A" 2>/dev/null && git log --oneline -3 2>/dev/null || echo "  (not set up)"
        echo -e "${YELLOW}CODER-B:${NC}"
        cd "$DIR_CODER_B" 2>/dev/null && git log --oneline -3 2>/dev/null || echo "  (not set up)"
        ;;

    watch)
        watch -n 10 "cd $DIR_MAIN && gh issue list"
        ;;

    # ============================================================
    # GIT
    # ============================================================
    sync)
        echo -e "${GREEN}Syncing all worktrees...${NC}"
        echo -e "${CYAN}Main:${NC}" && cd "$DIR_MAIN" && git pull origin main
        echo -e "${CYAN}Coder-A:${NC}" && cd "$DIR_CODER_A" && git pull origin dev/coder-a
        echo -e "${CYAN}Coder-B:${NC}" && cd "$DIR_CODER_B" && git pull origin dev/coder-b
        echo -e "${GREEN}Done${NC}"
        ;;

    merge-a)
        echo -e "${YELLOW}Merging CODER-A fixes...${NC}"
        cd "$DIR_MAIN"
        git fetch origin
        git merge --no-ff origin/dev/coder-a -m "FIX-MERGE: CODER-A rendering fixes"
        git push origin main
        echo -e "${GREEN}Done. Test with: npm run dev${NC}"
        ;;

    merge-b)
        echo -e "${YELLOW}Merging CODER-B fixes...${NC}"
        cd "$DIR_MAIN"
        git fetch origin
        git merge --no-ff origin/dev/coder-b -m "FIX-MERGE: CODER-B scene/UI fixes"
        git push origin main
        echo -e "${GREEN}Done. Test with: npm run dev${NC}"
        ;;

    merge-both)
        echo -e "${YELLOW}Merging both (A first per rules)...${NC}"
        $0 merge-a && $0 merge-b
        echo -e "${GREEN}Both merged. Test: npm run dev${NC}"
        ;;

    push-queues)
        cd "$DIR_MAIN"
        git add TASK-QUEUE/ && git commit -m "Update task queues $(date +%Y-%m-%d)" && git push origin main
        ;;

    # ============================================================
    # HELP
    # ============================================================
    help|--help|-h|"")
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  DISPATCH - FIX PHASE (Dark Screen Bug)${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}DIRECTORIES:${NC}"
        echo "  SUPERVISOR: $DIR_MAIN (main)"
        echo "  CODER-A:    $DIR_CODER_A (dev/coder-a)"
        echo "  CODER-B:    $DIR_CODER_B (dev/coder-b)"
        echo ""
        echo -e "${CYAN}TEST:${NC}      test | verify | build"
        echo -e "${CYAN}ISSUES:${NC}    issues | issues-a | issues-b | close <#>"
        echo -e "${CYAN}LAUNCH:${NC}    start-all | start-a | start-b | start-super"
        echo -e "${CYAN}CONTINUE:${NC}  continue-a | continue-b | continue-super"
        echo -e "${CYAN}STATUS:${NC}    status | watch"
        echo -e "${CYAN}GIT:${NC}       sync | merge-a | merge-b | merge-both"
        echo ""
        echo -e "${YELLOW}FIX PRIORITY:${NC}"
        echo "  Phase 1: #3,#4,#6 (CODER-A) + #11,#13 (CODER-B) → See submarine"
        echo "  Phase 2: #7,#8 + #12,#14 → Controls work"
        echo "  Phase 3: #5 + #9,#10 → Full UI viewports"
        ;;

    *)
        echo -e "${RED}Unknown: $1${NC}. Run './dispatch.sh help'"
        exit 1
        ;;
esac
