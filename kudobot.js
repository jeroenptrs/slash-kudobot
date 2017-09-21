module.exports = (ctx, cb) => {
    var cmds = ctx.body.text.split(" ", 2);

    //Filter out troll commands.
    if(cmds.length > 0 && (cmds[0].substring(0,1) === '@' || cmds[0].toLowerCase() === 'all' || cmds[0].toLowerCase() === 'admin')){
        ctx.storage.get(function(error, data){
            if (error) return cb(error);

            //List all kudos.
            if(cmds[0].toLowerCase() === 'all'){

                //If kudos have been set
                if(data !== undefined) {
                    //Keys = usernames!
                    var k = Object.keys(data), attachments = [];

                    //Set attachment data with all keys.
                    for(i = 0; i < k.length; i++){
                        o = {text: "<" + k[i] + ">: " + data.users[k[i]]};
                        if(data.users[k[i]] > 0)
                            o.color = "good";
                        else if(data.users[k[i]] < 0)
                            o.color = "danger";
                        attachments.push(o);
                    }


                    if(k.length > 1){
                        //If at least 2 users gained kudos, calculate the total and place it in a string.
                        var total = 0,
                            totalString = "";
                        for (i=0; i < k.length; i++)
                            total += data.users[k[i]];
                        totalString += "Together you received " + total + " kudo";

                        //Push to attachment data, if total != 1, add an s at the end.
                        if(total === 1)
                            attachments.push({text: totalString + ".", color: "good"});
                        else if (total === 0)
                            attachments.push({text: totalString + "s!"});
                        else if (total > 0)
                            attachments.push({text: totalString + "s!", color: "good"});
                        else
                            attachments.push({text: totalString + "s!", color: "danger"});
                    }

                    //Print all kudos.
                    return cb(null, { response_type: "in_channel", text: `Listing # of kudos for all users.`, attachments: attachments});
                }
                else return cb(null, { response_type: "in_channel", text: `Nobody has kudos.` });

            }

            //kudo++
            else if(cmds[0].substring(0,1) === '@' && cmds[1] === '++'){
                //Store user name for quick use.
                var u = cmds[0];

                if(u.substring(1) === ctx.body.user_name)
                    return cb(null, { response_type: "in_channel", text: `You can't kudo yourself!` });

                //Is this the first time we're using this?
                if(data === undefined) {
                    data = {};
                    data.users[u] = 1;
                }

                //Is this the first time we're adding to this user?
                else if (data.users[u] == null) { data.users[u] = 1; }

                //User exists
                else data.users[u]++;

                //Store that shit!
                ctx.storage.set(data, function (error) {
                    if (error) return cb(error);
                    return cb(null, { response_type: "in_channel", text: `Got it, <${cmds[0]}> received a kudo!` });
                });

            }

            //kudo--
            else if(cmds[0].substring(0,1) === '@' && cmds[1] === '--' && data.minmin === true){


                //Store user name for quick use.
                var u = cmds[0];

                if(u.substring(1) === ctx.body.user_name)
                    return cb(null, { response_type: "in_channel", text: `You can't kudo yourself!` });

                //Is this the first time we're using this?
                if(data === undefined) {
                    data = {};
                    data.users[u] = -1;
                }

                //Is this the first time we're adding to this user?
                else if (data.users[u] == null) { data.users[u] = -1; }

                //User exists
                else data.users[u]--;

                //Store that shit!
                ctx.storage.set(data, function (error) {
                    if (error) return cb(error);
                    return cb(null, { response_type: "in_channel", text: `Got it, <${cmds[0]}> lost a kudo.` });
                });
            }

            //List kudos for user.
            else if(cmds[0].substring(0,1) === '@'){


                //Store user name for quick use.
                var u = cmds[0];

                if (data === undefined || data.users[u] == null){
                    return cb(null, { response_type: "in_channel", text: `<${cmds[0]}> has no kudos.` });
                }

                if(data.users[u] !== 1)
                    return cb(null, { response_type: "in_channel", text: `<${cmds[0]}> has ${data.users[u]} kudos!` });
                else
                    return cb(null, { response_type: "in_channel", text: `<${cmds[0]}> has ${data.users[u]} kudo.` });
            }

            //Set an admin, for now it's just one.
            else if(cmds[0].toLowerCase() === 'admin' && cmds[1].toLowerCase() === 'init'){
                if(data === undefined || data.admin == null) {
                    data.admin[data.ctx.user_name] = true;
                    return cb(null, { text: `<@${ctx.user_name}> is now admin.` });
                }
                else return cb(null, { text: `An admin has already been set` });
            }

            //Enable/disable negative kudos (so /kudo @user --). Disabled on standard and needs an admin to activate.
            else if(cmds[0].toLowerCase() === 'admin' && cmds[1] === '--' && (data.admin != null && data.admin[user] === true)){
                if(data.minmin == null || data.minmin !== true){
                    data.minmin = true;
                    return cb(null, { text: `Negative kudos have been activated.` });
                }
                else {
                    data.minmin = false;
                    return cb(null, { text: `Negative kudos have been deactivated.` });
                }
            }

        });
    }
    else return cb(null, { response_type: "in_channel", text: `Sorry, this is not a user!` });
}
