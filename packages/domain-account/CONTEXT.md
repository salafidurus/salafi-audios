# Account

The Account context defines the person using Salafi Durus and the identity by
which personal relationships are scoped.

## Language

**User**:
The person represented in the platform's account and personal-state model.

**Account**:
The User's platform relationship, including identity details and account
preferences. An Account is not the same thing as a listening session.

**Identity**:
The recognized representation that lets the platform associate an action with a
User.

**Session**:
A time-bounded authenticated relationship between a User and a client.

**Authentication**:
The process of establishing which User a Session represents.

**Authorization**:
The decision about whether an authenticated User may perform an action on a
resource.

_Avoid_: account as a synonym for User; authentication as a synonym for
authorization; session as proof of permission for every action.

## Boundaries

Identity and Session establish who is acting. The [Authority and Editorial
Control context](../../apps/api/CONTEXT.md) decides what that User may do for a
specific action and scope. Personal state is defined by the [Personal State and
Synchronization context](../core-sync/CONTEXT.md).
