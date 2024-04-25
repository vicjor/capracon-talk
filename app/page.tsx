'use client'
import { Tables } from "@/database.types"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { EventList } from "../components/EventList"


export type Event = Tables<'events'>

export default function Index() {

  const [events, setEvents] = useState<Event[]>([])
  const supabase = createClient()

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*') 
    if (error) {
      console.error(error)
    } else{
      setEvents(data)
    }
  }


  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div className="m-auto">
      <EventList events={events}/>
    </div>
  )
}

