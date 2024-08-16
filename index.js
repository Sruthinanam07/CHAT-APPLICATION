const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

main()
.then(() => 
    {console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

//index route to show all chats

app.get("/chats", async (req, res) => {
   let chats = await Chat.find(); //asynchronous function
   console.log(chats);
   res.render("index.ejs", { chats });
});

//New Route
app.get("/chats/new", (req, res)=>{
    res.render("new.ejs");
})

//create route
app.post("/chats", (req,res) => {
    let { from, to, msg }=req.body;
    let newChat = new Chat(
        {
            from: from,
            to: to,
            msg: msg,
            created_at: new Date(),
        }
    );
    newChat.save()
    .then(res =>{
        console.log("Chat was saved")
    })
    .catch(err => {
        console.log(err);
    })
    res.redirect("/chats");
});

//edit route
app.get("/chats/:id/edit", async (req, res) => {
    let { id } = req.params;
    let chat = await  Chat.findById(id);
    res.render("edit.ejs", { chat });
})

//update route
app.put("/chats/:id", async (req, res) =>{
    let { id } = req.params;
    let { msg: newMsg } = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(
        id,
        {msg : newMsg}, 
        {runValidators: true, new: true});
        console.log(updatedChat);
        res.redirect("/chats");
})

//delete route
app.delete("/chats/:id", async (req, res) =>{
    let { id } = req.params;
    let deletedchat = await Chat.findByIdAndDelete(id);
    console.log("/chats");
    res.redirect("/chats");
})

// map reduce
// app.get("/chats/messageCount", async (req, res) => {
//      try {
//         // Define the map function
//        var mapFunction = function() {
//             emit(this.from, 1); // Emit a key-value pair with 'from' as the key and 1 as the value
//         };
//       // Define the reduce function
//         var reduceFunction = function(key, values) {
//             return Array.sum(values); // Sum up all the values for each key (user)
//          };

//         // Execute the MapReduce operation on the collection
//         const result = await Chat.mapReduce(
//             mapFunction,
//             reduceFunction,
//             { out: { inline: 1 } } // Output the result inline
//         );
//     res.render("messageCount.ejs", { result }); // Render a view to display the result
//     } catch (error) {
//         console.error("Error executing MapReduce operation:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

// AGGREGRATE
app.get("/chats/messageCount", async (req, res) => {
    try {
      const results = await Chat.aggregate([
        {
          $group: {
            _id: "$from",
            count: { $sum: 1 }
          }
        }
      ]);
      res.render("messageCount.ejs", { results });
    } catch (error) {
      console.error("Error executing aggregation:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  

app.get("/",(req,res)=>{
    res.send("working");
});
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});