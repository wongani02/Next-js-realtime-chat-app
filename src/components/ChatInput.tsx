'use client'

import { FunctionComponent, useRef, useState } from "react";
import TextareaAutosize from 'react-textarea-autosize'; 
import Button from "./ui/Button";
import axios from "axios";
import { toast } from "react-hot-toast";

interface ChatInputProps {
    chatPartner: User,
    chatid: string,
}
 
const ChatInput: FunctionComponent<ChatInputProps> = ({chatPartner, chatid}) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const sendMessage = async () =>{
        if (!input) return
        setIsLoading(true)

        try{
            await axios.post('/api/message/send',{
                text: input,
                chatid
            })

            setInput('')
            textareaRef.current?.focus()
        }catch (err){
            toast.error('something went wrong, please try again later or check your internet connection.')
        }finally{
            setIsLoading(false)
        }
    }

    return ( 
        <div className="border-t border-gray-200 px-4 pt-4 mb-0 sm:mb-0">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                <TextareaAutosize 
                ref={textareaRef}
                className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6 "
                placeholder={`message ${chatPartner.name}`}
                rows={1}
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{
                    if(e.key === 'Enter' && !e.shiftKey){
                        e.preventDefault()
                        sendMessage()
                    }
                }}
                />

                <div 
                onClick={()=>textareaRef.current?.focus()}
                aria-hidden='true'
                className="py-2">
                    <div className="py-px">
                        <div className="h-9"/>
                    </div>
                </div>

                <div 
                className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex shrink-0">
                        <Button
                        onClick={sendMessage}
                        type="submit"
                        isLoading={isLoading}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ChatInput;