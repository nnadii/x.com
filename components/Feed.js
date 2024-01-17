/* eslint-disable react-hooks/exhaustive-deps */
import { SparklesIcon } from "@heroicons/react/outline"
import { useEffect, useState } from "react"
import Input from "./Input"
import { onSnapshot, orderBy, collection, query } from "firebase/firestore"
import { db } from "@/firebase"
import Post from "./Post"


function Feed() {
    const [ posts, setPosts ] = useState([])

    useEffect(() => onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot) => {setPosts(snapshot.docs)}), [db])

    return (
        <div className="flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px] w-full">
            <div className="bg-black border-b border-gray-700">
                <div className="text-[#d9d9d9] flex items-center sm:justify-between px-3 sticky top-0 z-50">
                    <h2 className="text-lg sm:text-xl font-bold relative bottom-[-2] ml-5">Home</h2>
                    <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml:auto relative bottom-[-2] ml-5"><SparklesIcon className="h-5 text-white"/></div>
                </div>
                <div className="text-white flex items-center sm:justify-around sticky top-0 z-50">
                    <span className="font-bold hoverGrid">For you</span><div className="bottom-0 self-center bg-[#1D9BF0] inline-flex h-1.5 min-w-[58px] relative left-[-180px] top-[30px] rounded-full"></div>
                    <h4 className="hoverGrid text-gray-500">Following</h4>
                </div>
            </div>
            <Input />
            <div className="pb-72">
                {posts.map(post => <Post key={post.id} id={post.id} post={post.data()} />)}
            </div>
        </div>
    )
}

export default Feed