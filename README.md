# CapraCon 2024 - From idea to MVP in 45 minutes
This repo and the resulting code is the product of a 45 minutes live-coding during my talk at [CapraCon 2024](https://capracon.no/talk/fra-id-til-mvp-pa-45-minutter). During the talk I created a Supabase project, wrote all the code in this repo with a little help of [shadcn/ui Blocks](https://ui.shadcn.com/blocks) and deployed the application. The final (unpolished) results can be viewed at https://capracon-nach.vercel.app/. 

You can find the slide deck from the presentation here: [CapraCon 2024 Presentation](./CapraCon-Presentation.pdf)

#### Technologies used
- [Supabase](https://supabase.com/): Open Source Firebase alternative centered around PostgreSQL.
- [Next.js](https://nextjs.org/): React Meta Framework
- [shadcn/ui](https://ui.shadcn.com/): Open Source component library where you copy and paste the components you need directly into your apps.
- [Vercel](https://vercel.com/): Deploy your frontend apps with a few keystrokes. 
- [TailwindCSS](https://tailwindcss.com/): CSS framework


## High level approach to build this

### Create a Next.js project using a Supabase template
```bash
npx create-next-app@latest -e with-supabase <your-project-name> && cd <your-project-name>
```

### 1. Create a Supabase project
Go to [database.new](https://database.new/) and follow the instruction to create your first project. The free tier is more than sufficient for an application like this. 


### 2. Configure Supabase
Configure some needed boilerplate files to use the Supabase SDK.
```bash 
npx supabase init
```

### 3. Create .env.local with the variables from your project
```bash
NEXT_PUBLIC_SUPABASE_URL=<SUBSTITUTE_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUBSTITUTE_SUPABASE_ANON_KEY>
```
*If you deploy your application make sure to provide these variables to your hosting service. With Vercel you can add this in the dashboard or by using `vercel env add <NEXT_PUBLIC_xx>`.*

### 4. Log in to Supabase
Log in to have a valid login session from your terminal.
```bash
npx supabase login
```

### 5. Link your app to Supabase
```bash
npx supabase link --project-ref <PROJECT_REF>
```

### 6. Generate TypeScript types from your database schema
This will create TypeScript types based on your database schema. Remember to run the command again in case you make any changes to your schema.
```bash
mkdir types/ && npx supabase gen types typescript --linked --schema public > types/database.types.ts
```

These type may look scary at first, but try importing `Table` to a .ts/.tsx file and this snippet will give you an exact representation of your table in TypeScript. Depending on whether you wish to represent, insert og update something, you can use `Tables`, `TablesInsert` or `TablesUpdate`.
```jsx
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

type Event = Tables<'events'>
type EventInsert = TablesInsert<'events'> // Auto-generated values such as created_at are nullable
type EventUpdate = TablesUpdate<'events'> 
```

### 7. Init and add shadcn/ui to your app
Run these commands to initialize shadcn/ui in your app. You can select one or all of the components you wish to use by following the instructions. For this project I used `button`, `card`, `input`, `label` and `sonner`. 
```bash
npx shadcn-ui@latest init
npx shacdn-ui@latest add
```
Go to [shadcn/ui](https://ui.shadcn.com/docs/components/) and pick and choose whichever components you like. I also recommend checking out the [Blocks](https://ui.shadcn.com/blocks).


### Bonus: Use Supabase Realtime to listen to changes in your database
Supabase offers plenty of cool features. One of those is Realtime, which enables you to listen to any changes in your database to your application via the Supabase SDK. You can read more about all [Realtime Concepts here](https://supabase.com/docs/guides/realtime/concepts).

For this to work you first need to enable Realtime on each table you wish to use the Realtime API. Follow the steps in [this guide](https://supabase.com/docs/guides/realtime) to do so.

Practically I used this during my talk to instantly update the attendee list whenever a new attendee is registered at the event. The application will then instantly update the list. This requires no polling, and under the hood uses a WebSocket connection to enable two-way communication between the client and the server.

<details>
  <summary>Realtime Channels Example: Event attendees</summary>

  ```jsx
  const EventAttendees = ({ id }: { id: number }) => {
    const supabase = createClient();

    const [attendees, setAttendees] = useState<Attendee[]>([]);

    const fetchEventAttendees = async () => {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('event_id', id);

      if (error) {
        toast.error(error.message);
      } else {
        setAttendees(data);
      }
    };

    useEffect(() => {
      fetchEventAttendees();
    }, []);

    useEffect(() => {
      const channel = supabase
        .channel('attendees')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'attendees' },
            (payload) => {
              setAttendees((attendees) => [...attendees, payload.new as Attendee]);
            }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }, [supabase, attendees, setAttendees]);

    return (
      <div>
        <h1 className="text-2xl">Geiteliste</h1>
        <ul>
          {attendees.map(attendee => (
            <li key={attendee.id}>{attendee.name}</li>
          ))}
        </ul>
      </div>
    );
  }
```
</details>

### Final step: Write your own code
You're all set to start building your next web application. The repo can be the basis for inspiration for how to build your own app, but be aware that this was coded live on stage in udner 45 minutes. The resulting code and organization of files is therefore not optimal.