const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth= require("../middlewares/auth");

// create task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    author: req.user._id,
  });

  try {
    await task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(err);
  }
});

//  Get /tasks?completed=true
//  Get /tasks?limit=2&skip=2
//  get /tasks?sortBy=createdAt:asc or createdAt:desc
// read task / filter / sort 
router.get("/tasks",auth,async (req, res) => {
  const match={}
  const sort={}
  if(req.query.completed){
    match.completed=req.query.completed === 'true'
  }
  if(req.query.sortBy){
    const parts=req.query.sortBy.split(':')
    sort[parts[0]]=parts[1] === 'desc' ? -1:1
  }
  try {
    // const tasks = await Task.find({author: req.user._id});
    await req.user.populate({
      path:'tasks',
      match,
      options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//  get specfic task by id 
router.get("/tasks/:id",auth,async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({_id,author:req.user._id})
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

// update task 
router.patch("/tasks/:id",auth,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["description", "compeleted"];
  const isvalid = updates.every((update) => allowed.includes(update)); // return true if all true
  if (!isvalid) {
    return res.status(404).send("error : invalid update ");
  }

  const _id = req.params.id;
  try {
    const task = await Task.findOne({_id:req.params.id,author:req.user._id})
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete task
router.delete("/tasks/:id",auth,async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({_id:req.params.id,author: req.user._id})
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
