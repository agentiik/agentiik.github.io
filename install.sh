#!/bin/sh
# Installs agk, the Agentiik command line, asking before it changes anything.
#
#     curl -fsSL https://agentiik.github.io/install.sh | sh
#
# agk is built from the tagged source of agentiik/agentiik and never downloaded as a binary, so
# what runs is what the tag names, which is the reason the Homebrew formula gives for doing the
# same. Three ways to build it, offered in this order where the machine has them:
#
#   brew     the formula of agentiik/tap, as Get started installs it
#   go       Go 1.21 or later on this machine; it fetches the Go release agk needs by itself
#   docker   the official golang image, for a machine with Docker and no Go
#
# The last one is there because agk run --local needs a Docker daemon anyway: a machine that can
# run a workflow can build agk, with nothing else installed.
#
# Each of these may be set to answer a question before it is asked, and a run with no terminal
# to ask on, in a CI job for instance, takes the default of every question it is left:
#
#   AGK_METHOD    brew, go or docker
#   AGK_VERSION   the release to build, v0.5.0 for instance; the latest release otherwise,
#                 and the formula's own for Homebrew
#   AGK_BIN_DIR   where a build puts agk; /usr/local/bin where it is writable, ~/.local/bin otherwise
#   AGK_YES=1     ask nothing
#
# Nothing acts before main, called on the last line, so a download cut off halfway changes nothing.

set -eu

REPO=https://github.com/agentiik/agentiik
TAP=agentiik/tap
IMAGE=golang:latest
NEXT=https://agentiik.github.io/docs/#get-started

say() { printf '%s\n' "$*"; }
fail() { printf 'agk install: %s\n' "$*" >&2; exit 1; }

# The script arrives on standard input, so questions are read from the terminal itself. No
# terminal, or AGK_YES, and every question takes its default.
TTY=
if [ -z "${AGK_YES:-}" ] && (: </dev/tty) 2>/dev/null; then TTY=/dev/tty; fi

# ask QUESTION DEFAULT: the answer, or the default for an empty one.
ask() {
	if [ -z "$TTY" ]; then
		printf '%s\n' "$2"
		return
	fi
	printf '%s [%s] ' "$1" "$2" >"$TTY"
	IFS= read -r answer <"$TTY" || answer=
	printf '%s\n' "${answer:-$2}"
}

# confirm QUESTION: true for yes, the default.
confirm() {
	case "$(ask "$1" Y/n)" in
	Y/n | [Yy] | [Yy][Ee][Ss]) return 0 ;;
	*) return 1 ;;
	esac
}

platform() {
	case "$(uname -s)" in
	Linux) os=linux ;;
	Darwin) os=darwin ;;
	*) fail "agk runs on Linux and macOS, and this is $(uname -s). On Windows, run this inside WSL." ;;
	esac
	case "$(uname -m)" in
	x86_64 | amd64) arch=amd64 ;;
	arm64 | aarch64) arch=arm64 ;;
	*) fail "agk is built for amd64 and arm64, and this machine is $(uname -m)." ;;
	esac
}

# Go 1.21 is the first release that fetches the toolchain a module asks for, so any Go from
# there on builds agk whatever release the module names.
usable_go() {
	command -v go >/dev/null 2>&1 && command -v git >/dev/null 2>&1 || return 1
	gover=$(go env GOVERSION 2>/dev/null) || return 1
	# Split on purpose: the major and the minor version, as two arguments.
	# shellcheck disable=SC2046
	set -- $(printf '%s\n' "$gover" | sed -n 's/^go\([0-9][0-9]*\)\.\([0-9][0-9]*\).*/\1 \2/p')
	[ $# -eq 2 ] || return 1
	[ "$1" -gt 1 ] || [ "$2" -ge 21 ]
}

usable_docker() {
	command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

# The highest release, vX.Y.Z with no pre-release, read from the refs git itself would read.
latest_release() {
	curl -fsSL "$REPO.git/info/refs?service=git-upload-pack" | tr -d '\000' |
		LC_ALL=C sed -n 's#^.* refs/tags/v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)$#\1#p' |
		sort -u -t. -k1,1n -k2,2n -k3,3n | tail -n 1 | sed 's/^/v/'
}

choose_method() {
	methods=
	command -v brew >/dev/null 2>&1 && methods="$methods brew"
	usable_go && methods="$methods go"
	usable_docker && methods="$methods docker"
	if [ -n "${AGK_METHOD:-}" ]; then
		case " $methods " in
		*" $AGK_METHOD "*) method=$AGK_METHOD; return ;;
		esac
		fail "AGK_METHOD=$AGK_METHOD cannot be used here: it takes one of brew, go and docker, and this machine offers${methods:- none of them}."
	fi
	# Split on purpose: one argument per method.
	# shellcheck disable=SC2086
	set -- $methods
	case $# in
	0)
		say "agk is built from source, and this machine has nothing to build it with. Any one of these will do:"
		say "  Docker, which agk run --local needs anyway: https://docs.docker.com/get-started/get-docker/"
		say "  Go 1.21 or later, with git: https://go.dev/dl/"
		say "  Homebrew: https://brew.sh"
		fail "nothing was installed; install one of them, then run this again."
		;;
	1) method=$1; return ;;
	esac
	say "How should agk be built?"
	n=0
	for m in "$@"; do
		n=$((n + 1))
		case $m in
		brew) say "  $n) with Homebrew, from the formula $TAP/agk" ;;
		go) say "  $n) with Go, on this machine ($gover)" ;;
		docker) say "  $n) with Docker, in the $IMAGE image, a few hundred megabytes to pull once" ;;
		esac
	done
	while :; do
		pick=$(ask "Choice" 1)
		case $pick in
		'' | *[!0-9]*) ;;
		*) if [ "$pick" -ge 1 ] && [ "$pick" -le $# ]; then
			eval "method=\${$pick}"
			return
		fi ;;
		esac
		[ -n "$TTY" ] || fail "no choice numbered $pick."
		say "Answer with a number from 1 to $#."
	done
}

# writable DIR: DIR can be written to, or created by this account where it does not exist yet.
writable() {
	d=$1
	while [ ! -e "$d" ]; do d=$(dirname "$d"); done
	[ -d "$d" ] && [ -w "$d" ]
}

choose_dir() {
	if [ -n "${AGK_BIN_DIR:-}" ]; then
		writable "$AGK_BIN_DIR" || fail "AGK_BIN_DIR=$AGK_BIN_DIR is not a directory this account can write to."
		dir=$AGK_BIN_DIR
		return
	fi
	if writable /usr/local/bin; then dir=/usr/local/bin; else dir=$HOME/.local/bin; fi
	while :; do
		answer=$(ask "Install agk in" "$dir")
		# A tilde typed at the prompt reaches here as a character, which the shell never expands.
		# shellcheck disable=SC2088
		case $answer in
		"~") answer=$HOME ;;
		"~/"*) answer=$HOME/${answer#"~/"} ;;
		/*) ;;
		*) answer=$PWD/$answer ;;
		esac
		if writable "$answer"; then
			dir=$answer
			return
		fi
		[ -n "$TTY" ] || fail "$answer is not a directory this account can write to."
		say "$answer is not a directory this account can write to. Name another, or rerun this with sudo to install there."
	done
}

# The formula's build, step for step: the static helper a script step mounts at /agk/bin/agk,
# for both architectures a container runs on, then agk with the helper embedded. Cloned at the
# tag rather than fetched as an archive because go build stamps agk --version from the tag.
#
# Its arguments: the tag, a directory to clone into, the file to write, and the platform. It is
# the text of a script, run by sh here and inside the container, so it expands nothing itself.
# shellcheck disable=SC2016
BUILD='set -e
git -c advice.detachedHead=false clone --quiet --depth 1 --branch "$1" '"$REPO"' "$2"
cd "$2"
for a in amd64 arm64; do
	CGO_ENABLED=0 GOOS=linux GOARCH=$a go build -trimpath -o cmd/agk/internal/helper/bin/agk-linux-$a ./cmd/agk-helper
done
GOOS=$4 GOARCH=$5 go build -trimpath -ldflags "-s -w" -o "$3" ./cmd/agk'

build_with_go() {
	# GOTOOLCHAIN=auto lets this Go fetch the release the module names, from the Go module
	# proxy and checked against the checksum database, even where it was set to local.
	GOTOOLCHAIN=auto sh -c "$BUILD" build "$version" "$work/src" "$work/agk" "$os" "$arch"
}

build_with_docker() {
	mkdir -p "$work/out"
	# The image sets GOTOOLCHAIN=local; auto lets it fetch a newer Go should the module ask for
	# one. It runs as this account, so what it leaves in the directory can be removed by it.
	# cgo is off: the binary runs outside the container that built it, on whatever C library
	# this machine has, and on macOS it is cross-compiled.
	docker run --rm --user "$(id -u):$(id -g)" \
		-e HOME=/tmp -e GOPATH=/tmp/go -e GOCACHE=/tmp/cache -e GOTOOLCHAIN=auto -e CGO_ENABLED=0 \
		-v "$work/out:/out" "$IMAGE" \
		sh -c "$BUILD" build "$version" /tmp/src /out/agk "$os" "$arch"
}

main() {
	platform
	choose_method

	if [ "$method" = brew ]; then
		[ -z "${AGK_VERSION:-}" ] || say "AGK_VERSION is left aside: Homebrew builds the release its formula names."
		confirm "Install agk with brew install $TAP/agk?" || fail "nothing was installed."
		brew tap "$TAP"
		# Homebrew 7 loads a third-party tap's formulae only once the tap is trusted.
		if brew trust --help >/dev/null 2>&1; then brew trust "$TAP"; fi
		brew install "$TAP/agk"
		agk=$(brew --prefix)/bin/agk
	else
		version=${AGK_VERSION:-$(latest_release)}
		[ -n "$version" ] || fail "no release of $REPO could be read."
		choose_dir
		case $method in
		go) how="with Go" ;;
		docker) how="with Docker" ;;
		esac
		confirm "Build agk $version $how and install it in $dir?" || fail "nothing was installed."
		work=$(mktemp -d "${TMPDIR:-/tmp}/agk-install.XXXXXX")
		trap 'rm -rf "$work"' EXIT
		trap 'exit 130' INT TERM
		say "Building agk $version. The first build fetches its modules, which takes a minute or two."
		if [ "$method" = go ]; then
			build_with_go || fail "the build failed; what it said is above."
		else
			build_with_docker || fail "the build failed; what it said is above."
			mv "$work/out/agk" "$work/agk"
		fi
		# Copied beside the old one and then renamed over it, so an agk that is running keeps
		# its file and nothing ever finds half of the new one.
		mkdir -p "$dir"
		cp "$work/agk" "$dir/.agk.$$"
		chmod 755 "$dir/.agk.$$"
		mv -f "$dir/.agk.$$" "$dir/agk"
		agk=$dir/agk
	fi

	say ""
	"$agk" --version
	say "installed at $agk"
	case ":$PATH:" in
	*":$(dirname "$agk"):"*)
		found=$(command -v agk 2>/dev/null || true)
		[ "$found" = "$agk" ] || say "Another agk comes first in PATH, at $found: remove it, or put $(dirname "$agk") before it."
		;;
	*) say "$(dirname "$agk") is not in PATH. Add this line to your shell's profile: export PATH=\"$(dirname "$agk"):\$PATH\"" ;;
	esac
	usable_docker || say "agk run --local runs each step in a container, and no Docker daemon answers here: Docker Desktop, Colima or OrbStack on macOS, Docker Engine on Linux."
	say "Next: $NEXT"
}

main "$@"
