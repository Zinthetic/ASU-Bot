import * as Discord from 'discord.js'
import {DiscordAPIError, Message} from "discord.js";
import {APIErrors} from "../../interfaces/Errors";
import {debug} from '../../utility/Logging'

export default function safeSendMessage(channel : Discord.Channel, message: string | number | object, deleteAfter?: number) : void {
    let out : string;
    if (typeof message === 'number'){
        out = message.toString();
    }
    else if (typeof message === 'object'){
        out = JSON.stringify(message, null, '\t');
    }
    else {
        out = message;
    }
    if (channel instanceof Discord.TextChannel){
        if (!channel.guild.available) return debug.error(`Guild ${channel.guild.name} is not available.`);

        channel.send(out).then((message: Message | Message[]) => {
            if (message instanceof Message && deleteAfter){
                message.delete(deleteAfter * 1000);
            }
        }).catch(err => {
            if (err instanceof DiscordAPIError){
                if (err.message === APIErrors.MISSING_PERMISSIONS){
                    debug.error(`Could not send message to ${channel.name} in ${channel.guild.name}, missing permissions`
                    , 'safeSendMessage');
                    // TODO: Mod logging errors
                    return;
                }
                else if (err.message ===APIErrors.UNKNOWN_GUILD){
                    return debug.error(`Unknown guild ${channel.guild.name}.\n` + err.stack, 'safeSendMessage')
                }
                else if (err.message === APIErrors.CANNOT_SEND_EMPTY_MESSAGE){
                    return debug.error(`Tried to send an empty message to ${channel.name}`, 'safeSendMessage')
                }
                debug.error(`Unexpected error while sending message to channel ${channel.name}\n` + err.stack, 'safeSendMessage');
            }
        })
    }
}