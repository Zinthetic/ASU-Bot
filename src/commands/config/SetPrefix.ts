import * as Discord from 'discord.js'
import {IGuild, isIGuild} from "../../database/TableTypes";
import {Database} from "../../database/Database";
import * as dbg from "debug";
import {adminOnlyCommand} from "../../handlers/Replies";
import onlyOwner from "../../handlers/permissions/decorators/onlyAdmin";

export const debug = {
    error  : dbg('Bot:setPrefix:Error')
};


export default function setPrefix(message: Discord.Message, prefix: string, database: Database){
    if (prefix === undefined) return message.channel.send('No prefix was entered.');
    else if (!message.member.hasPermission('ADMINISTRATOR'))
        return message.channel.send(adminOnlyCommand);
    database.setPrefix(message.guild, prefix).then((res:IGuild|Error|-1 )=> {
        if (isIGuild(res))
            message.channel.send('Prefix changed to ' + res.prefix);
        else {
            debug.error('Error while setting prefix.', res);
        }
    });
}