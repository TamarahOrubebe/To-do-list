//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://tamarah:arsenalfc2@cluster0-6eiap.mongodb.net/todolistDB", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Successfully connected to the DB");
    }
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do list!"
});

const item2 = new Item({
  name: "Click on the + to add an item"
});

const item3 = new Item({
  name: "Use the checkbox to strike off an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  
  });

});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!foundList) {
      const list = new List({
				name: customListName,
				items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName)
    } else {
      res.render("list", {listTitle: customListName,	newListItems: foundList.items });
    }

    
  })
})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");

  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/" + listName);
  }
});


app.post("/delete", function (req, res) {
  const checkedItemName = req.body.checkbox;
  const listName = req.body.listName; 

  if (listName === "Today") {
Item.findOneAndDelete({ name: checkedItemName }, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log("successfully deleted item");
	}
	res.redirect("/");
});
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { name: checkedItemName } } }, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("successfully deleted item");
      }
    });
    res.redirect("/" + listName);
  }

  
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
