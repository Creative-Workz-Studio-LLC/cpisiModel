package main

// #!omni:code --go
// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║ [BLOCK:ROOT] THE BODY: SANDBOX ENGINE (THE SENTINEL - FIXED)                                                       ║
// ╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"
	"time"
)

// [FILE:IDENTITY] cpisi-sandbox-engine
// Jurisdiction: RELATIVE (Internal to Container)

func main() {
	// Inside the container, the mount point is /root/mobile_sandbox
	bufferPath := "/root/sandbox/command_buffer.omnicog"
	
	fmt.Println("[SENTINEL] Mobile Sandbox Engine Active. Watching the 0.0...")

	for {
		content, err := ioutil.ReadFile(bufferPath)
		if err != nil {
			// If file not found, we wait for the mount.
			time.Sleep(5 * time.Second)
			continue
		}

		raw := strings.TrimSpace(string(content))
		if raw == "" || raw == "[0, 0, 0]" {
			time.Sleep(2 * time.Second)
			continue
		}

		fmt.Printf("[SENTINEL] Pulse Detected: %s\n", raw)
		
		if strings.HasPrefix(raw, "act LS") {
			// In the container, we just list the current root
			runCommand("ls", "-la", "/root/sandbox/")
		} else if strings.HasPrefix(raw, "act STATUS") {
			runCommand("echo", "[STUB] Git status requires full repo mount.")
		} else {
			fmt.Printf("[SENTINEL] Unauthorized Act: %s. HALTING.\n", raw)
		}

		ioutil.WriteFile(bufferPath, []byte("[0, 0, 0]"), 0644)
		fmt.Println("[SENTINEL] Reset to Anchor.")
	}
}

func runCommand(name string, args ...string) {
	cmd := exec.Command(name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()
	if err != nil {
		fmt.Printf("[ERROR] Act failed: %v\n", err)
	}
}

// ║                                                                                                  [BLOCK:ROOT-->END] ║
// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
