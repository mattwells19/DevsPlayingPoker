# DevsPlayingPoker

# Routes

| Name          | Method | Path                     | Description                                                              |
| ------------- | ------ | ------------------------ | ------------------------------------------------------------------------ |
| Landing       | GET    | /                        | Load landing page                                                        |
| Show Room     | GET    | /rooms/:id               | Load room                                                                |
| New Room      | GET    | /rooms/new               | Show form to create new room (may not need if we want to keep barebones) |
| Create Room   | POST   | /rooms                   | Create new room                                                          |
| Edit Room     | GET    | /rooms/:id/edit          | Show form to edit room                                                   |
| Update Room   | PUT    | /rooms/:id               | Update room                                                              |
| Delete Room   | DELETE | /rooms/:id               | Delete room                                                              |
| Get Tickets   | GET    | /rooms/:id/tickets       | Get all tickets for room                                                 |
| Get Ticket    | GET    | /rooms/:id/tickets/:name | Get ticket info                                                          |
| Create Ticket | POST   | /rooms/:id/tickets       | Create new ticket                                                        |
| Update Ticket | PUT    | /rooms/:id/tickets/:name | Update ticket details                                                    |
| Delete Ticket | DELETE | /rooms/:id/tickets/:name | Delete a ticket                                                          |
| Vote          | PATCH  | /rooms/:id/              | Vote on active ticket (not sure if best implementation, but it's easy)   |
| Show User     | GET    | /users/:id               | Show user details                                                        |
| New User      | GET    | /users                   | Show form to create new user                                             |
| Create User   | POST   | /users                   | Create new user                                                          |
| Edit User     | GET    | /users/:id               | Show form to update user                                                 |
| Update User   | PUT    | /users/:id               | Update User                                                              |
| Delete User   | DELETE | /users/:id               | Delete User                                                              |

# Mongo Schemas

## User

```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {  // Hashed and salted
    type: String,
    required: true,
    minlength: 12
  },
  picture: String,  // URL for picture
  totalPoints: Number,  // For gamification - XP, gold, etc.
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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
  description: {  // So users can give fun description for persistent rooms
    type: String,
    maxlength: 500
  },
  imageUrl: String,  // Add an image to the room, like an icon or mascot, etc.
  manager: String,  // _id of owner
  participants: [String],  // _ids of participants
  tickets: [  // May want to extract into another collection and reference?
    {
      name: String,
      votes: [
        {
          user: String,  // _id of user
          points: Number,
          explanation: {
            type: String,
            maxlength: 100
          }
        }
      ],
      isActive: {
        type: Boolean,
        default: false
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```
