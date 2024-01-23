import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    image: {
        required: true,
        type: String
    },
    caption: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
})

export default mongoose.model('Post', postSchema)