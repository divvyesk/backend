const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    //both subscriber and channel are users
    //but we have kept them seperately
    //now this is a many to many function
    //because a channel can have multiple subscribers
    //and a subscriber can subscribe to multiple channels
    //and for each, we will have a new document in the subscription collection
    //this document contains info on which channel has been subscribed by which subscribe
    

    //now if we want to find number of subscribers for a channel(say Chai Aur Code), we can simply find all documents in subscription collection where channel is that channel(Chai aur Code) and count them
    //now if we want to find the channels that a subscriber(say Divvye) has subscribed to, we can simply find all documents in subscription collection where subscriber is that subscriber(Divvye) and get the channel ids from those documents and then find the channel details using those channel ids
    
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    }, 
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)