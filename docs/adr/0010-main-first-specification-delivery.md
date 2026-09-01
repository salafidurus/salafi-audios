# Main-first specification delivery

Specifications remain tracker coordination artifacts rather than integration
branches. Implementation tickets branch from `origin/main` and merge directly
into `main`, with genuine dependency edges controlling readiness; finalization
verifies the accepted result on `main` without another merge boundary. This
removes disposable branch integration while preserving explicit acceptance and
auditable ticket sequencing.
