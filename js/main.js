$(document).ready(function() {

    db = openDatabase("Board", "0.1", "Notes list.", 200000);

    if(!db){alert("Failed to connect to database.");}

    db.transaction(function(tx) {
        var ctb = tx.executeSql("CREATE TABLE Notes (id, left, top, color, content)", [], null, null);
    });

    $(".menu .header").click(function() {
        $(".menu").toggleClass('hide');
    })

    $(".btnColor").click(function() {
        $(".color").click();
    })

    var mode = "default";

    load();

    function load() {
        var index = 0;
        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM Notes", [], function(tx, result) {
                for(item of result.rows){
                    index++;
                    var note = $(".trash .note").clone().removeClass("template");
                    note.css({background:item.color,left:`${item.left}px`,top:`${item.top}px`});
                    note.attr("data-id",item.id);
                    note.find(".content").html(item.content);
                    note.mousedown(function() {
                        mode = "move";
                    })
                    note.mouseup(function() {
                        mode = "default";
                        update(this);
                    })
            
                    note.mousemove(function(e) {
                        if(mode === "move"){
                            $(this).css({
                                left:e.pageX -150 + "px",
                                top:e.pageY - 150 + "px"
                            })
                        }
                    })
                    $(".header .current").html(`${index}/10`);
                    $(".board").append(note);
                }
            }, null)
        });
    }

    $(".btnCreate").click(function() {
        var color = $(".menu .color").val();
        var content = $(".menu .content").val();
        if(content)create(color,content);
    })

    function create(color, content) {

        var dt = new Date().getTime();
        var note = $(".template").clone().removeClass("template");
        note.attr("data-id",dt);
        note.find(".content").html(content);
        note.css({background:color});
        note.mousedown(function() {
            mode = "move";
        })
        note.mouseup(function() {
            mode = "default";
            update(this);
        })

        note.mousemove(function(e) {
            if(mode === "move"){
                $(this).css({
                    left:e.pageX -150 + "px",
                    top:e.pageY - 150 + "px"
                })
            }
        })

        db.transaction(function(txC) {

            txC.executeSql("SELECT * FROM Notes", [], function(err,result) {
                console.log(result.rows.length)

                if(result.rows.length<=10){
                    db.transaction(function(tx) {
                        tx.executeSql("INSERT INTO Notes(id, left, top, color, content) values(?, ?, ?, ?, ?)", [dt, 10, 10, color, content], null, null);
                    },function(err,res){
                        if (err)console.log(err)
                    });
                    $(".board").append(note);
                }
                else{
                    $(".msgCotainer").addClass("showFlex");
                    $(".msgCotainer .countErorr").addClass("show");

                    setTimeout(function() {
                        $(".msgCotainer .countErorr").removeClass("show");
                        $(".msgCotainer").removeClass("showFlex");
                    },3500);

                }
            })
        })

    }

    function update(item) {
        var id = $(item).data("id");
        var left = $(item).position().left.toString();
        var top = $(item).position().top.toString();
        console.log(id, left, top,item)

        db.transaction(function(tx) {
            tx.executeSql('update Notes set left=?, top=? where id=?', [left,top,id], function(transaction, result) {
                console.log(result);
                console.info('Record Updated Successfully!');
            }, function(transaction, error) {
                console.log(error);
            });
        });

    }

});