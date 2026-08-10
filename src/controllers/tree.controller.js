import { TreeNode } from "../models/tree.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"

const insertRoot = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const existingRoot = await TreeNode.findOne({
        owner: req.user._id,
        parent: null
    });
 
    if (existingRoot) {
        throw new ApiError(400, "Root already exists for this user");
    }

    const root = await TreeNode.create({
        owner: req.user._id,
        name: name,
        parent: null
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { id: root._id }, "Root inserted successfully")
        )
});


const insertNode = asyncHandler(async (req, res) => {
    const { name, parent_id } = req.body;

    const node =
        await TreeNode.create({
            owner: req.user._id,
            name,
            parent: parent_id
        });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { id: node._id }, "Node inserted successfully")
        )
});


const loadData = asyncHandler(async (req, res) => {
    const nodes = await TreeNode.find({
        owner: req.user._id
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, nodes, "Tree nodes fetched successfully")
        )
});


const updateNode = asyncHandler(async (req, res) => {
    const updatedNode = await TreeNode.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user._id
        },
        {
            name: req.body.name
        },
        {
            returnDocument: "after"
        }
    );

    if (!updatedNode) {
        throw new ApiError(404, "Node not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedNode, "Node updated successfully")
        )
});


async function deleteNodeRecursive(id, ownerId) {

    const children = await TreeNode.find({
        parent: id,
        owner: ownerId
    });

    for (const child of children) {
        await deleteNodeRecursive(child._id, ownerId);
    }

    await TreeNode.findOneAndDelete({ _id: id, owner: ownerId });
}


const deleteNode = asyncHandler(async (req, res) => {
    const node = await TreeNode.findOne({
        _id: req.params.id,
        owner: req.user._id
    });

    if (!node) {
        throw new ApiError(404, "Node not found");
    }

    await deleteNodeRecursive(req.params.id, req.user._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Nodes deleted successfully")
        )
});


export {
    insertRoot,
    insertNode,
    loadData,
    updateNode,
    deleteNode
}