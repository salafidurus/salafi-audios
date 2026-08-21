# Listening

The Listening context defines how a person plays the audio attached to content
and maintains continuity across listening sessions.

## Language

**Audio asset**:
Media metadata associated with playable content. It describes where and how
audio can be obtained; it is not the audio binary itself.

**Track**:
A resolved playable unit in a listening Queue, associated with a Single or
Lesson.

**Playback**:
The active act of consuming a Track through a listening client.

**Listening session**:
A period in which a person is actively using Playback. It may move through
multiple Tracks in a Queue.

**Queue**:
The ordered set of Tracks prepared for Playback.

**Progress**:
A person's position and listening state for a Track. Progress belongs to the
person, not to the public Listing.

**Resume position**:
The point from which Playback should continue for a person's Progress.

**Completion**:
A progress outcome recorded when a Track reaches its natural end, indicating
that a person has finished enough of it to count as completed. Manual stopping
or skipping does not imply Completion. Completion is not the same as publication
or download.

**Stream**:
A remotely delivered source used when no usable local Track source is
available.

**Downloaded audio**:
A device-local playable source that can be preferred over a remote Stream.

_Avoid_: lecture as the playable unit in all cases; downloaded as a synonym for
completed.

## Boundaries

Listening can emit personal Progress intent and consume Catalog content, but it
does not publish content, grant permissions, or decide cross-device authority.
Personal synchronization vocabulary is defined by the [Personal State and
Synchronization context](../core-sync/CONTEXT.md).
