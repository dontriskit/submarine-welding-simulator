#!/bin/bash
# DISPATCH.SH - Control all 3 Claude Code terminals from one CLI
# Usage: ./dispatch.sh <command> [args]

PROJECT_DIR="/home/mhm/Documents/submarine-welding-simulator"
QUEUE_DIR="$PROJECT_DIR/TASK-QUEUE"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Timestamp
ts() {
    date "+%Y-%m-%d %H:%M"
}

case "$1" in
    # ============================================================
    # LAUNCH COMMANDS
    # ============================================================

    start-all)
        echo -e "${GREEN}Starting all 3 terminals...${NC}"
        echo ""
        echo "Run these commands in 3 separate terminals:"
        echo ""
        echo -e "${CYAN}Terminal 1 (CODER-A):${NC}"
        echo "  cd $PROJECT_DIR && git checkout dev/coder-a"
        echo '  claude "Read MASTER-PROMPT.md and ROLES/terminal-1-coder-a.md, then execute tasks from TASK-QUEUE/queue-coder-a.md"'
        echo ""
        echo -e "${CYAN}Terminal 2 (CODER-B):${NC}"
        echo "  cd $PROJECT_DIR && git checkout dev/coder-b"
        echo '  claude "Read MASTER-PROMPT.md and ROLES/terminal-2-coder-b.md, then execute tasks from TASK-QUEUE/queue-coder-b.md"'
        echo ""
        echo -e "${CYAN}Terminal 3 (SUPERVISOR):${NC}"
        echo "  cd $PROJECT_DIR && git checkout main"
        echo '  claude "Read MASTER-PROMPT.md and ROLES/terminal-3-supervisor.md, then execute tasks from TASK-QUEUE/queue-supervisor.md"'
        ;;

    start-a)
        echo -e "${CYAN}Starting CODER-A...${NC}"
        cd "$PROJECT_DIR"
        git checkout dev/coder-a
        claude "Read MASTER-PROMPT.md and ROLES/terminal-1-coder-a.md. Then check TASK-QUEUE/queue-coder-a.md and execute the first uncompleted task. After completing each task, mark it [x] in the queue file and commit your changes."
        ;;

    start-b)
        echo -e "${CYAN}Starting CODER-B...${NC}"
        cd "$PROJECT_DIR"
        git checkout dev/coder-b
        claude "Read MASTER-PROMPT.md and ROLES/terminal-2-coder-b.md. Then check TASK-QUEUE/queue-coder-b.md and execute the first uncompleted task. After completing each task, mark it [x] in the queue file and commit your changes."
        ;;

    start-super)
        echo -e "${CYAN}Starting SUPERVISOR...${NC}"
        cd "$PROJECT_DIR"
        git checkout main
        claude "Read MASTER-PROMPT.md and ROLES/terminal-3-supervisor.md. Then check TASK-QUEUE/queue-supervisor.md and monitor for merge requests. Review PRs when both coders complete their phase."
        ;;

    # ============================================================
    # STATUS COMMANDS
    # ============================================================

    status)
        echo -e "${GREEN}=== PROJECT STATUS ===${NC}"
        echo ""

        echo -e "${CYAN}CODER-A Progress:${NC}"
        DONE_A=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        TODO_A=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-a.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_A | Remaining: $TODO_A"

        echo -e "${CYAN}CODER-B Progress:${NC}"
        DONE_B=$(grep -c "\[x\]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        TODO_B=$(grep -c "\[ \]" "$QUEUE_DIR/queue-coder-b.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_B | Remaining: $TODO_B"

        echo -e "${CYAN}SUPERVISOR Progress:${NC}"
        DONE_S=$(grep -c "\[x\]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        TODO_S=$(grep -c "\[ \]" "$QUEUE_DIR/queue-supervisor.md" 2>/dev/null || echo 0)
        echo "  Completed: $DONE_S | Remaining: $TODO_S"

        echo ""
        echo -e "${YELLOW}Recent Completions:${NC}"
        tail -5 "$QUEUE_DIR/completed.log" 2>/dev/null || echo "  (none)"

        echo ""
        echo -e "${RED}Blockers:${NC}"
        tail -5 "$QUEUE_DIR/blocked.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"

        echo ""
        echo -e "${YELLOW}Human Requests:${NC}"
        tail -5 "$QUEUE_DIR/human-request.log" 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "  (none)"
        ;;

    watch)
        echo -e "${GREEN}Watching for updates... (Ctrl+C to stop)${NC}"
        watch -n 5 "$0 status"
        ;;

    # ============================================================
    # TASK COMMANDS
    # ============================================================

    add-task)
        ROLE="$2"
        TASK="$3"
        if [ -z "$ROLE" ] || [ -z "$TASK" ]; then
            echo "Usage: $0 add-task <a|b|super> \"task description\""
            exit 1
        fi

        case "$ROLE" in
            a) FILE="$QUEUE_DIR/queue-coder-a.md" ;;
            b) FILE="$QUEUE_DIR/queue-coder-b.md" ;;
            super) FILE="$QUEUE_DIR/queue-supervisor.md" ;;
            *) echo "Invalid role. Use: a, b, or super"; exit 1 ;;
        esac

        echo "- [ ] **NEW**: $TASK" >> "$FILE"
        echo -e "${GREEN}Task added to $ROLE queue${NC}"
        ;;

    unblock)
        ROLE="$2"
        if [ -z "$ROLE" ]; then
            echo "Usage: $0 unblock <a|b|super>"
            exit 1
        fi
        echo "[$(ts)] [HUMAN] UNBLOCKED: $ROLE can proceed" >> "$QUEUE_DIR/blocked.log"
        echo -e "${GREEN}Unblock signal sent${NC}"
        ;;

    respond)
        RESPONSE="$2"
        if [ -z "$RESPONSE" ]; then
            echo "Usage: $0 respond \"response message\""
            exit 1
        fi
        echo "[$(ts)] [HUMAN] RESPONSE: $RESPONSE" >> "$QUEUE_DIR/human-request.log"
        echo -e "${GREEN}Response logged${NC}"
        ;;

    # ============================================================
    # GIT COMMANDS
    # ============================================================

    sync)
        echo -e "${GREEN}Syncing all branches...${NC}"
        cd "$PROJECT_DIR"
        git fetch origin

        echo -e "${CYAN}Main:${NC}"
        git checkout main && git pull origin main

        echo -e "${CYAN}Coder-A:${NC}"
        git checkout dev/coder-a && git pull origin dev/coder-a

        echo -e "${CYAN}Coder-B:${NC}"
        git checkout dev/coder-b && git pull origin dev/coder-b

        git checkout main
        echo -e "${GREEN}All branches synced${NC}"
        ;;

    merge-a)
        echo -e "${YELLOW}Merging CODER-A to main...${NC}"
        cd "$PROJECT_DIR"
        git checkout main
        git pull origin main
        git merge --no-ff origin/dev/coder-a -m "MERGE: CODER-A tasks"
        git push origin main
        echo -e "${GREEN}CODER-A merged${NC}"
        ;;

    merge-b)
        echo -e "${YELLOW}Merging CODER-B to main...${NC}"
        cd "$PROJECT_DIR"
        git checkout main
        git pull origin main
        git merge --no-ff origin/dev/coder-b -m "MERGE: CODER-B tasks"
        git push origin main
        echo -e "${GREEN}CODER-B merged${NC}"
        ;;

    merge-both)
        echo -e "${YELLOW}Merging both coders (A first, then B)...${NC}"
        $0 merge-a
        $0 merge-b
        echo -e "${GREEN}Both merged. Notifying coders to pull...${NC}"
        echo "[$(ts)] [SUPERVISOR] MERGE COMPLETE - All coders pull main" >> "$QUEUE_DIR/completed.log"
        ;;

    # ============================================================
    # LOG COMMANDS
    # ============================================================

    logs)
        echo -e "${GREEN}=== ALL LOGS ===${NC}"
        echo ""
        echo -e "${CYAN}--- Completed ---${NC}"
        cat "$QUEUE_DIR/completed.log"
        echo ""
        echo -e "${RED}--- Blocked ---${NC}"
        cat "$QUEUE_DIR/blocked.log"
        echo ""
        echo -e "${YELLOW}--- Human Requests ---${NC}"
        cat "$QUEUE_DIR/human-request.log"
        ;;

    clear-logs)
        echo "# Completed Tasks Log" > "$QUEUE_DIR/completed.log"
        echo "# Blocked Tasks Log" > "$QUEUE_DIR/blocked.log"
        echo "# Human Request Log" > "$QUEUE_DIR/human-request.log"
        echo -e "${GREEN}Logs cleared${NC}"
        ;;

    # ============================================================
    # HELP
    # ============================================================

    help|*)
        echo -e "${GREEN}DISPATCH.SH - Multi-Terminal Claude Code Orchestrator${NC}"
        echo ""
        echo -e "${CYAN}Launch Commands:${NC}"
        echo "  start-all     Show commands to start all 3 terminals"
        echo "  start-a       Start CODER-A session"
        echo "  start-b       Start CODER-B session"
        echo "  start-super   Start SUPERVISOR session"
        echo ""
        echo -e "${CYAN}Status Commands:${NC}"
        echo "  status        Show progress of all agents"
        echo "  watch         Live-watch status (updates every 5s)"
        echo ""
        echo -e "${CYAN}Task Commands:${NC}"
        echo "  add-task <a|b|super> \"task\"   Add task to queue"
        echo "  unblock <a|b|super>            Signal unblock"
        echo "  respond \"message\"             Respond to human request"
        echo ""
        echo -e "${CYAN}Git Commands:${NC}"
        echo "  sync          Pull all branches"
        echo "  merge-a       Merge CODER-A to main"
        echo "  merge-b       Merge CODER-B to main"
        echo "  merge-both    Merge both (A first, then B)"
        echo ""
        echo -e "${CYAN}Log Commands:${NC}"
        echo "  logs          Show all logs"
        echo "  clear-logs    Clear all logs"
        ;;
esac
