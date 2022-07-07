# DevsPlayingPoker

# Routes

| Name        | Method | Path        | Description                         |
| ----------- | ------ | ----------- | ----------------------------------- |
| Landing     | GET    | /           | Load landing page                   |
| New Room    | GET    | /create     | Show form to create new room        |
| Create Room | POST   | /create     | Create room in DB                   |
| Join Room   | GET    | /join       | Show form to join room (enter name) |
| Show Room   | GET    | /room/:code | Show room                           |

# Mongo Schemas

## User

```javascript
{
  name: {
    type: String,
    required: true,
  },
  moderator: [String],  // Room codes of which they are moderator
  voter: [String],  // Room codes in which they are voter
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Room

```javascript
{
  name: String,  // So users can give fun names for persistent rooms
  code: Number,  // 4-digit code used for joining the room
  moderator: String,  // _id of moderator
  voters: [String],  // _ids of voters
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```
