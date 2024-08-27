'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'

export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit, error } = useChat()

    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            <h1 className="text-2xl font-bold text-center mb-4">Customer Support Chatbot</h1>
            <div className="border-t border-gray-300 pt-4 mb-4">
                {messages.map((m) => (
                    <div key={m.id} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {m.content}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center">
                <input
                    className="flex-grow px-4 py-2 text-base rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={input}
                    placeholder="Ask a question..."
                    onChange={handleInputChange}
                />
                <button
                    className="px-4 py-2 text-base font-medium text-white bg-blue-500 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="submit"
                >
                    Send
                </button>
            </form>
            {error && (
                <div className="text-red-500 mt-2">
                    Error: {error.message}
                </div>
            )}
        </div>
    )
}