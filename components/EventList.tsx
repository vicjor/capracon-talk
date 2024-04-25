'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Event } from "../app/page";

export const EventList = ({ events }: { events: Event[]; }) => {
  return (
    <div className="grid gap-8">
      {events.map((event) => (
        <Link href={`events/${event.id}`}>
          <Card key={event.id} className="hover:bg-slate-100">
            <CardHeader>
              <CardTitle>{event.name} 🥳</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="">{event.description}</p>
              <br/>
              <p className="font-bold">🎤 {event.host}</p>
              <p className="font-thin">📍 {event.location}</p>
            </CardContent>
          </Card>
        </Link>
      ))}

    </div>
  );
};
