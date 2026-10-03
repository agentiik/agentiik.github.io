package console

// Copied into cmd/agk/internal/console of an agentiik checkout by .github/console-shots.mjs, run
// and removed again: it draws agk console as its own screen tests do, on recorded answers in a
// virtual terminal, and writes each screen's cells with their colours as JSON for the site to
// render. It lives here rather than in agentiik because what the site shows is the site's choice,
// and because it reaches what only a test of the package can: the model, its keys and its depth.

import (
	"context"
	"encoding/json"
	"image/color"
	"io"
	"os"
	"path/filepath"
	"testing"
	"time"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

// shot is one screen the site shows, as console-shots.mjs asks for it.
type shot struct {
	Name   string              `json:"name"`
	Who    string              `json:"who"`
	Run    string              `json:"run"`
	Width  int                 `json:"width"`
	Height int                 `json:"height"`
	Depth  string              `json:"depth"`
	Keys   []string            `json:"keys"`
	Logs   map[string][]string `json:"logs"`
}

// segment is a run of cells of one style on a line: their text, one grapheme a cell.
type segment struct {
	Cells []string `json:"cells"`
	Fg    string   `json:"fg,omitempty"`
	Bg    string   `json:"bg,omitempty"`
	Bold  bool     `json:"bold,omitempty"`
	Faint bool     `json:"faint,omitempty"`
	Under bool     `json:"under,omitempty"`
}

func hex(c color.Color) string {
	if c == nil {
		return ""
	}
	r, g, b, _ := c.RGBA()
	return "#" + string([]byte{digits[r>>12&15], digits[r>>8&15], digits[g>>12&15], digits[g>>8&15], digits[b>>12&15], digits[b>>8&15]})
}

const digits = "0123456789abcdef"

func keyOf(k string) tea.KeyPressMsg {
	switch k {
	case "tab":
		return tea.KeyPressMsg{Code: tea.KeyTab}
	case "enter":
		return tea.KeyPressMsg{Code: tea.KeyEnter}
	case "esc":
		return tea.KeyPressMsg{Code: tea.KeyEscape}
	case "up":
		return tea.KeyPressMsg{Code: tea.KeyUp}
	case "down":
		return tea.KeyPressMsg{Code: tea.KeyDown}
	}
	r := []rune(k)[0]
	return tea.KeyPressMsg{Code: r, Text: k}
}

func TestSiteShots(t *testing.T) {
	dir := os.Getenv("AGK_SITE_SHOTS")
	if dir == "" {
		t.Skip("AGK_SITE_SHOTS names the directory console-shots.mjs writes the answers and the shots into")
	}
	now, err := time.Parse(time.RFC3339, os.Getenv("AGK_SITE_NOW"))
	if err != nil {
		t.Fatal(err)
	}
	var shots []shot
	b, err := os.ReadFile(filepath.Join(dir, "shots.json"))
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(b, &shots); err != nil {
		t.Fatal(err)
	}
	for _, sh := range shots {
		var s scenario
		b, err := os.ReadFile(filepath.Join(dir, sh.Who+".json"))
		if err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal(b, &s); err != nil {
			t.Fatal(err)
		}
		for _, theme := range []string{"light", "dark"} {
			// A sender that sends nothing, so that the console offers what alice may do to a run.
			sender := func(context.Context, string, string, any, any) error { return nil }
			o := Options{Run: sh.Run, Theme: theme, Read: s.read, Send: sender, Now: func() time.Time { return now }, Installation: "agentiik.acme.example"}
			if sh.Logs != nil {
				o.Follow = func(_ context.Context, _, step string, out, _ io.Writer) error {
					for _, l := range sh.Logs[step] {
						io.WriteString(out, l+"\n")
					}
					return nil
				}
			}
			n := New(t.Context(), o)
			n.tick = func(time.Duration, func(time.Time) tea.Msg) tea.Cmd { return nil }
			n.depth, n.settled = trueColour, true
			if sh.Depth == "256" {
				n.depth = twoFiftySix
			}
			var m tea.Model = n
			m = send(t, m, tea.WindowSizeMsg{Width: sh.Width, Height: sh.Height})
			for _, msg := range run(m.Init()) {
				m = send(t, m, msg)
			}
			for _, k := range sh.Keys {
				m = send(t, m, keyOf(k))
			}
			screen := m.(Model).screen()
			m.(Model).unfollow()
			c := lipgloss.NewCanvas(sh.Width, sh.Height)
			c.Compose(lipgloss.NewLayer(screen))
			lines := make([][]segment, sh.Height)
			for y := range sh.Height {
				for x := 0; x < sh.Width; {
					cell := c.CellAt(x, y)
					seg := segment{Cells: []string{" "}}
					step := 1
					if cell != nil {
						if cell.Content != "" {
							seg.Cells[0] = cell.Content
						}
						step = max(1, cell.Width)
						for range step - 1 {
							seg.Cells = append(seg.Cells, "")
						}
						seg.Fg, seg.Bg = hex(cell.Style.Fg), hex(cell.Style.Bg)
						seg.Bold, seg.Faint = cell.Style.Attrs&1 != 0, cell.Style.Attrs&2 != 0
						seg.Under = cell.Style.Underline != 0
					}
					if l := len(lines[y]); l > 0 {
						last := &lines[y][l-1]
						if last.Fg == seg.Fg && last.Bg == seg.Bg && last.Bold == seg.Bold && last.Faint == seg.Faint && last.Under == seg.Under {
							last.Cells = append(last.Cells, seg.Cells...)
							x += step
							continue
						}
					}
					lines[y] = append(lines[y], seg)
					x += step
				}
			}
			out, err := json.Marshal(map[string]any{"width": sh.Width, "height": sh.Height, "lines": lines})
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(filepath.Join(dir, sh.Name+"-"+theme+".json"), out, 0o644); err != nil {
				t.Fatal(err)
			}
		}
	}
}
