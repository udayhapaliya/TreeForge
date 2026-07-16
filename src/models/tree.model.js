import mongoose, { Schema } from 'mongoose';

const treeNodeSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    parent: {
        type: Schema.Types.ObjectId,
        ref: "TreeNode",
        default: null
    }

}, {
    timestamps: true
});

export const TreeNode = mongoose.model('TreeNode', treeNodeSchema); 