'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables, TablesInsert } from "@/database.types"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type Event = Tables<'events'>
export type Attendee = TablesInsert<'attendees'>

export default function EventPage({params} :{params: {id: string}}) {
  const [event, setEvent] = useState<Event>()
  const supabase = createClient()


  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) {
      toast.error(error.message)
    } else{
      setEvent(data)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [])  

  if (!event) {
    return null
  }
  return (
    <div className="m-auto">
      <LoginForm event={event}/>
    </div>
  )
}



function LoginForm({event}: {event: Event}) {
  const [name, setName] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('attendees')
      .insert({name, event_id: event.id})
    if (error) {
      toast.error(error.message)
    } else{
      setName('')
      toast.success('Du er påmeldt!')
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{event.name}</CardTitle>
        <CardDescription>
          Skriv inn navnet ditt for å melde deg på arrangement
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Navn</Label>
          <Input onChange={e => setName(e.target.value)} id="name" type="name" placeholder="Pølsa" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">Meld meg på </Button>
      </CardFooter>
      <CardContent>
        <EventAttendees id={event.id} />
      </CardContent>
    </Card>
  )
}


const EventAttendees = ({id}:{id: number}) => { 
  const supabase = createClient()

  const [attendees, setAttendees] = useState<Attendee[]>([])

  const fetchEventAttendees = async () => {
    const { data, error } = await supabase
      .from('attendees')
      .select('*')
      .eq('event_id', id)
    if (error) {
      toast.error(error.message)
    } else{
      setAttendees(data)
    }
  }

  useEffect(() => {
    fetchEventAttendees()
  }, [])


  useEffect(() => {
    const channel = supabase
    .channel("attendees")
    .on("postgres_changes", 
      {event: "INSERT", schema:"public", table: "attendees"},
      (payload) => {
        setAttendees((attendees) => [...attendees, payload.new as Attendee]);
      }
    ).subscribe();
    return () =>{
       supabase.removeChannel(channel)
      }
  }, [supabase, attendees, setAttendees])

  return (
    <div>
      <h1 className="text-2xl">Geiteliste</h1>
      <ul>
        {attendees.map(attendee => (
          <li key={attendee.id}>{attendee.name}</li>
        ))}
      </ul>
    </div>
  )  
 }