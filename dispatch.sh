#!/bin/bash
# DISPATCH.SH - Control all 3 Claude Code terminals from one CLI
# Uses git worktrees for parallel development without branch conflicts
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
# AGENT PROMPTS - Assume agent knows NOTHING, uses WORKTREE
# ============================================================

PROMPT_CODER_A='You are CODER-A in a parallel development team.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-coder-a
YOUR BRANCH: dev/coder-a (already checked out - DO NOT switch branches)

FIRST, read these files IN ORDER:
1. @COLLABORATION-RULES.md - Branch rules, file ownership, commit format
2. @ROLES/terminal-1-coder-a.md - Your role and workflow
3. @TASK-QUEUE/queue-coder-a.md - Your task queue
4. @src/types/interfaces.ts - Interface contracts to implement

WORKFLOW:
1. git pull origin dev/coder-a
2. Find first [ ] task in queue
3. Implement following COLLABORATION-RULES.md
4. Commit: [CODER-A] <task-id>: <description>
5. Mark [x] in queue, push to origin
6. Continue next task

YOUR FILES: src/core/*, src/input/*, src/state/*, src/physics/*, src/systems/*, src/training/*, src/multiplayer/*, src/App.ts
NEVER EDIT: src/entities/*, src/ui/*, src/cameras/*, public/* (CODER-B owns these)'

PROMPT_CODER_B='You are CODER-B in a parallel development team.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-coder-b
YOUR BRANCH: dev/coder-b (already checked out - DO NOT switch branches)

FIRST, read these files IN ORDER:
1. @COLLABORATION-RULES.md - Branch rules, file ownership, commit format
2. @ROLES/terminal-2-coder-b.md - Your role and workflow
3. @TASK-QUEUE/queue-coder-b.md - Your task queue
4. @src/types/interfaces.ts - Interface contracts to implement

WORKFLOW:
1. git pull origin dev/coder-b
2. Find first [ ] task in queue
3. Implement following COLLABORATION-RULES.md
4. Commit: [CODER-B] <task-id>: <description>
5. Mark [x] in queue, push to origin
6. Continue next task

YOUR FILES: src/entities/*, src/cameras/*, src/ui/*, src/effects/*, src/environment/*, src/scenarios/*, src/missions/*, src/shaders/*, public/*
NEVER EDIT: src/core/*, src/input/*, src/state/* (CODER-A owns these)'

PROMPT_SUPERVISOR='You are SUPERVISOR in a parallel development team.

YOUR WORKING DIRECTORY: /home/mhm/Documents/submarine-welding-simulator
YOUR BRANCH: main (DO NOT switch branches)

FIRST, read these files IN ORDER:
1. @COLLABORATION-RULES.md - Merge rules, conflict resolution
2. @ROLES/terminal-3-supervisor.md - Your role and workflow
3. @CORE-PLAN-SUPERVISION.md - PR review checklists
4. @TASK-QUEUE/queue-supervisor.md - Your tasks
5. @CORE-PLAN.md - Tech tree and progress

WORKFLOW:
1. git pull origin main
2. Monitor TASK-QUEUE/*.log for blockers/requests
3. When coders finish phase, review PRs
4. ALWAYS merge CODER-A first, then CODER-B
5. Run tests after merge
6. Update progress tracking

YOU NEVER CODE - only review, merge, coordinate.'

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
    # LAUNCH
    # ============================================================
    start-all)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  PARALLEL DEVELOPMENT - 3 SEPARATE DIRECTORIES${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${CYAN}Terminal 1 - CODER-A:${NC}"
        echo -e "  ${YELLOW}cd $DIR_CODER_A${NC}"
        echo '  claude "You are CODER-A. Read @COLLABORATION-RULES.md, @ROLES/terminal-1-coder-a.md, @TASK-QUEUE/queue-coder-a.md. Your branch is dev/coder-a. Execute tasks."'
        echo ""
        echo -e "${CYAN}Terminal 2 - CODER-B:${NC}"
        echo -e "  ${YELLOW}cd $DIR_CODER_B${NC}"
        echo '  claude "You are CODER-B. Read @COLLABORATION-RULES.md, @ROLES/terminal-2-coder-b.md, @TASK-QUEUE/queue-coder-b.md. Your branch is dev/coder-b. Execute tasks."'
        echo ""
        echo -e "${CYAN}Terminal 3 - SUPERVISOR:${NC}"
        echo -e "  ${YELLOW}cd $DIR_MAIN${NC}"
        echo '  claude "You are SUPERVISOR. Read @COLLABORATION-RULES.md, @CORE-PLAN-SUPERVISION.md, @TASK-QUEUE/queue-supervisor.md. Monitor and merge PRs."'
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
        claude "You are CODER-A in $DIR_CODER_A (dev/coder-a). Read @COLLABORATION-RULES.md. Task: $2. Commit as [CODER-A]."
        ;;

    task-b)
        [ -z "$2" ] && echo "Usage: $0 task-b \"task\"" && exit 1
        cd "$DIR_CODER_B"
        claude "You are CODER-B in $DIR_CODER_B (dev/coder-b). Read @COLLABORATION-RULES.md. Task: $2. Commit as [CODER-B]."
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
        claude "You are CODER-A in $DIR_CODER_A (dev/coder-a). Read @COLLABORATION-RULES.md and @TASK-QUEUE/queue-coder-a.md. Continue first [ ] task."
        ;;

    continue-b)
        cd "$DIR_CODER_B"
        claude "You are CODER-B in $DIR_CODER_B (dev/coder-b). Read @COLLABORATION-RULES.md and @TASK-QUEUE/queue-coder-b.md. Continue first [ ] task."
        ;;

    continue-super)
        cd "$DIR_MAIN"
        claude "You are SUPERVISOR in $DIR_MAIN (main). Read @COLLABORATION-RULES.md, @CORE-PLAN-SUPERVISION.md. Check logs, merge if ready."
        ;;

    # ============================================================
    # STATUS
    # ============================================================
    status)
        echo -e "${GREEN}=== PROJECT STATUS ===${NC}"
        echo ""
        echo -e "${CYAN}Worktrees:${NC}"
        cd "$DIR_MAIN" && git worktree list
        echo ""

        echo -e "${CYAN}CODER-A ($DIR_CODER_A):${NC}"
        DONE_A=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        TODO_A=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        echo "  Done: $DONE_A | Todo: $TODO_A"
        echo "  Next: $(grep -m1 "\[ \]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null | sed 's/.*\*\*\([^*]*\)\*\*.*/\1/' | head -c 50)"

        echo ""
        echo -e "${CYAN}CODER-B ($DIR_CODER_B):${NC}"
        DONE_B=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        TODO_B=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        echo "  Done: $DONE_B | Todo: $TODO_B"
        echo "  Next: $(grep -m1 "\[ \]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null | sed 's/.*\*\*\([^*]*\)\*\*.*/\1/' | head -c 50)"

        echo ""
        echo -e "${CYAN}SUPERVISOR ($DIR_MAIN):${NC}"
        DONE_S=$(grep -c "\[x\]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        TODO_S=$(grep -c "\[ \]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        echo "  Done: $DONE_S | Todo: $TODO_S"

        echo ""
        echo -e "${YELLOW}Completed:${NC}"
        tail -3 "$QUEUE_DIR/completed.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"

        echo ""
        echo -e "${RED}Blockers:${NC}"
        tail -3 "$QUEUE_DIR/blocked.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"
        ;;

    watch)
        watch -n 5 "$0 status"
        ;;

    # ============================================================
    # QUEUE
    # ============================================================
    add-task)
        [ -z "$2" ] || [ -z "$3" ] && echo "Usage: $0 add-task <a|b|super> \"task\"" && exit 1
        case "$2" in
            a) FILE="$QUEUE_DIR/queue-coder-a.md" ;;
            b) FILE="$QUEUE_DIR/queue-coder-b.md" ;;
            super) FILE="$QUEUE_DIR/queue-supervisor.md" ;;
            *) echo "Invalid: use a, b, or super"; exit 1 ;;
        esac
        echo "- [ ] **HUMAN**: $3" >> "$FILE"
        echo -e "${GREEN}Added to $2 queue${NC}"
        ;;

    unblock)
        [ -z "$2" ] && echo "Usage: $0 unblock <a|b|super> [msg]" && exit 1
        echo "[$(ts)] [HUMAN] UNBLOCKED $2: ${3:-proceed}" >> "$QUEUE_DIR/blocked.log"
        echo -e "${GREEN}Unblocked $2${NC}"
        ;;

    respond)
        [ -z "$2" ] && echo "Usage: $0 respond \"msg\"" && exit 1
        echo "[$(ts)] [HUMAN] RESPONSE: $2" >> "$QUEUE_DIR/human-request.log"
        echo -e "${GREEN}Response logged${NC}"
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
        echo -e "${YELLOW}Merging CODER-A...${NC}"
        cd "$DIR_MAIN"
        git fetch origin
        git merge --no-ff origin/dev/coder-a -m "MERGE: CODER-A - $(date +%Y-%m-%d)"
        git push origin main
        echo "[$(ts)] [SUPERVISOR] Merged CODER-A" >> "$QUEUE_DIR/completed.log"
        echo -e "${GREEN}Done. CODER-A run: git pull origin main${NC}"
        ;;

    merge-b)
        echo -e "${YELLOW}Merging CODER-B...${NC}"
        cd "$DIR_MAIN"
        git fetch origin
        git merge --no-ff origin/dev/coder-b -m "MERGE: CODER-B - $(date +%Y-%m-%d)"
        git push origin main
        echo "[$(ts)] [SUPERVISOR] Merged CODER-B" >> "$QUEUE_DIR/completed.log"
        echo -e "${GREEN}Done. CODER-B run: git pull origin main${NC}"
        ;;

    merge-both)
        echo -e "${YELLOW}Merging both (A first per rules)...${NC}"
        $0 merge-a && $0 merge-b
        echo -e "${GREEN}Both merged. Coders pull main.${NC}"
        ;;

    push-queues)
        cd "$DIR_MAIN"
        git add TASK-QUEUE/ && git commit -m "Queue update $(date +%Y-%m-%d)" && git push origin main
        ;;

    # ============================================================
    # LOGS
    # ============================================================
    logs)
        echo -e "${CYAN}=== Completed ===${NC}"
        cat "$QUEUE_DIR/completed.log" | grep -v "^#"
        echo -e "${RED}=== Blocked ===${NC}"
        cat "$QUEUE_DIR/blocked.log" | grep -v "^#"
        echo -e "${YELLOW}=== Human Requests ===${NC}"
        cat "$QUEUE_DIR/human-request.log" | grep -v "^#"
        ;;

    clear-logs)
        echo "# Completed" > "$QUEUE_DIR/completed.log"
        echo "# Blocked" > "$QUEUE_DIR/blocked.log"
        echo "# Human Requests" > "$QUEUE_DIR/human-request.log"
        echo -e "${GREEN}Cleared${NC}"
        ;;

    # ============================================================
    # HELP
    # ============================================================
    help|--help|-h|"")
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  DISPATCH - Parallel Claude Code Orchestrator (Git Worktrees)${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}DIRECTORIES:${NC}"
        echo "  SUPERVISOR: $DIR_MAIN (main)"
        echo "  CODER-A:    $DIR_CODER_A (dev/coder-a)"
        echo "  CODER-B:    $DIR_CODER_B (dev/coder-b)"
        echo ""
        echo -e "${CYAN}SETUP:${NC}     setup | worktrees"
        echo -e "${CYAN}LAUNCH:${NC}    start-all | start-a | start-b | start-super"
        echo -e "${CYAN}CONTINUE:${NC}  continue-a | continue-b | continue-super"
        echo -e "${CYAN}TASK:${NC}      task-a | task-b | task-super \"...\""
        echo -e "${CYAN}STATUS:${NC}    status | watch | logs"
        echo -e "${CYAN}QUEUE:${NC}     add-task <a|b|super> \"...\" | unblock | respond"
        echo -e "${CYAN}GIT:${NC}       sync | merge-a | merge-b | merge-both | push-queues"
        ;;

    *)
        echo -e "${RED}Unknown: $1${NC}. Run './dispatch.sh help'"
        exit 1
        ;;
esac
