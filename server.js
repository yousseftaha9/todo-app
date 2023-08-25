import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const app = express();
const port = 3000;
let todayNotes = [];
let workNotes = [];
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
var arrayOfWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const mongoDB = "mongodb+srv://admin-youssef:test123@cluster0.dvsu2rd.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('DB is connected'))
.catch(err => console.log(err)); 

const itemsSchema = new mongoose.Schema ({
    name: {
        type: String,
      }
});
 
const Item = mongoose.model("Item", itemsSchema); // new collection

//Creating items
const item1 = new Item({
  name: "Welcome to your todo list."
});
 
const item2 = new Item({
  name: "Hit + button to create a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

var dateObj = new Date()
var weekdayNumber = dateObj.getDay()
var weekdayName = arrayOfWeekdays[weekdayNumber]
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var d = new Date();
var monthName = monthNames[d.getMonth()];

app.get('/', (req, res)=>{
    
    Item.find({})
    .then(function(foundItems){
      res.render("index.ejs", { name: weekdayName, month:monthName, newListItems: foundItems, listTitle: "Today" });
  //       if(foundItems.length === 0){
  //           Item.insertMany(defaultItems)
  // .then(function(){
  //   console.log("Successfully saved into our DB.");
  // })
  // .catch(function(err){
  //   console.log(err);
  // });
  //       }
        
    })
    // .then(function(foundItems){
    //     res.render("index.ejs", { name: weekdayName, month:monthName, newListItems: foundItems });
    //   })
      .catch(function(err){
        console.log(err);
      });
    // res.render("index.ejs", {array: todayNotes, name: weekdayName, month:monthName});
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list.ejs",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
 
  
  
})


app.post("/today", (req, res)=> {
    const itemName = req.body["note"]
    let newItem = new Item({
      name: itemName
    });
    newItem.save();
    res.redirect("/");
    
})


app.post("/", (req, res) => {

  let itemName = req.body.note
  let listName = req.body.list.trim()  // Remove leading/trailing spaces
  const item = new Item({
      name: itemName,
  })
  if (listName === "Today") {

      item.save()

      res.redirect("/")

  } else {

      List.findOne({ name: listName }).then(foundList => {

          if (foundList) {

              foundList.items.push(item)

              foundList.save()

              res.redirect("/" + listName)

          } else {

              const newList = new List({

                  name: listName,

                  items: [item],

              })

              newList.save()

              res.redirect("/" + listName)

          }

      }).catch(err => {

          console.log(err);

      });

  }

})


app.post("/delete", (req, res)=>{
    let itemID = req.body["checkbox"];
    let listName = req.body.listName;

    if(listName == "Today") {
      Item.findByIdAndRemove(itemID)
      .then(function(foundItem){Item.deleteOne({_id: itemID})})
 
    res.redirect("/");
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}})
      .then(function (foundList)
      {
        res.redirect("/" + listName);
      });
    }


  
});

app.post("/work", (req, res)=> {
  const itemName = req.body["note"]
  let newItem = new Item({
    name: itemName
  });
  newItem.save();
  res.redirect("/");
  
})

app.listen(port, ()=> {
    console.log(`server running on port ${port}.`)
})