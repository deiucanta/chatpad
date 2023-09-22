import { notifications } from "@mantine/notifications";
import { SpotlightProvider, spotlight } from "@mantine/spotlight";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { useChat, useSpaceAppActions } from "../hooks/contexts";
import { IconBolt, IconSearch } from "@tabler/icons-react";
import { AppAction } from "../db";

export function SelectIntegrationModal({
 contentText,
 contentHtml,
 children,
}: {
 contentText: string;
 contentHtml: string;
 children: ReactElement;
}) {
 const [open, setOpen] = useState(false);

 const { chat } = useChat();
 const { setSpaceAppActions } = useSpaceAppActions();

 const [spotlightActions, setSpotlightActions] = useState<any[]>([]);

 useEffect(() => {
  const dataFetch = async () => {
   const res = await fetch(`/api/space/actions`);
   const items = await res.json();
   const actions = items as unknown as AppAction[];

   setSpaceAppActions(actions);

   const spotlightActionsItems = actions.map((action) => ({
    title: action.title,
    description: action.instance_alias,
    icon: action.icon_url ? (
     <img
      width={30}
      style={{ borderRadius: 5 }}
      src={action.icon_url}
      alt={action.title}
     />
    ) : (
     <IconBolt size={28} />
    ),
    onTrigger: async () => {
     try {
      if (action) {
       const titleKeys = ["title", "name"];
       const contentKeys = ["content", "description", "text"];

       let payload: { [key: string]: string } = {};
       for (const input of action.input!) {
        if (titleKeys.includes(input.name)) {
         payload[input.name] = chat?.description || "Dialogue Chat";
        } else if (contentKeys.includes(input.name)) {
         payload[input.name] =
          action.app_name === "Minima" ? contentHtml : contentText;
        } else if (input.name === "html") {
         payload[input.name] = contentHtml;
        }
       }

       const res = await fetch(`/api/space/actions/invoke`, {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify({
         instanceId: action.instance_id,
         actionName: action.name,
         payload: payload,
        }),
       });

       const invocation = await res.json();
       console.log(invocation);
       if (invocation.type === "@deta/raw") {
        navigator.clipboard.writeText(invocation.data);
       } else if (invocation.type === "@deta/detail") {
        navigator.clipboard.writeText(
         invocation.data.ref ||
          invocation.data.url ||
          invocation.data.title ||
          invocation.data.text
        );
       } else {
        navigator.clipboard.writeText(JSON.stringify(invocation.data));
       }

       notifications.show({
        title: "Success",
        color: "green",
        message: `Action "${action.title}" invoked successfully.`,
       });
      } else {
       notifications.show({
        title: "Error",
        color: "red",
        message: "Integration not found.",
       });
      }
     } catch (error: any) {
      if (error.toJSON().message === "Network Error") {
       notifications.show({
        title: "Error",
        color: "red",
        message: "No internet connection.",
       });
      }
      const message = error.response?.data?.error?.message;
      if (message) {
       notifications.show({
        title: "Error",
        color: "red",
        message,
       });
      }
     }
    },
   }));

   setSpotlightActions(spotlightActionsItems);
   spotlight.open();
  };
  if (open) {
   dataFetch();
  }
 }, [open]);

 const handleOpen = () => {
  setOpen(true);
 };

 return (
  <>
   {cloneElement(children, { onClick: handleOpen })}
   {open && (
    <SpotlightProvider
     actions={spotlightActions}
     searchIcon={<img src="/assets/integrations/deta.png" height={28} />}
     searchPlaceholder="Search Space App Actions..."
     shortcut={null}
     nothingFoundMessage="Nothing found..."
     onSpotlightOpen={() => setOpen(true)}
     onSpotlightClose={() => setOpen(false)}
     limit={Infinity}
     styles={{
      content: {
       border: "4px solid #dbdbdb88",
      },
      searchInput: {
       "border-bottom": "3px solid #dbdbdb54 !important",
      },
     }}
    ></SpotlightProvider>
   )}
   {/* <Modal opened={opened} onClose={close} title="Space App Actions" withinPortal size="lg">
        <form
          onSubmit={async (event) => {
            try {
              setSubmitting(true);
              event.preventDefault();

              const action = spaceAppActions?.find(i => {
                const appName = selectedAppAction.split('__')[0]
                const actionName = selectedAppAction.split('__')[1]

                return i.app_name === appName && i.name === actionName
              })

              if (action) {
                
                const titleKeys = ['title', 'name']
                const contentKeys = ['content', 'description', 'text']
                
                let payload: { [key: string]: string } = {}
                for (const input of action.input!) {
                  if (titleKeys.includes(input.name)) {
                    payload[input.name] = chat?.description || 'Dialogue Chat'
                  } else if (contentKeys.includes(input.name)) {
                    payload[input.name] = contentHtml
                  }
                }

                const res = await fetch(`/api/space/actions/invoke`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    instanceId: action.instance_id,
                    actionName: action.name,
                    payload: payload
                  })
                })

                console.log(res)

                navigator.clipboard.writeText('noteUrl')

                notifications.show({
                  title: "Success",
                  color: "green",
                  message: "Message stored in Minima and link copied to clipboard.",
                })
              } else {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message: "Integration not found.",
                });
              }
            } catch (error: any) {
              if (error.toJSON().message === "Network Error") {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message: "No internet connection.",
                });
              }
              const message = error.response?.data?.error?.message;
              if (message) {
                notifications.show({
                  title: "Error",
                  color: "red",
                  message,
                });
              }
            } finally {
              setSubmitting(false);
              setSelectedAppAction('');
              close();
            }
          }}
        >
          <Stack>
            <Select
              value={selectedAppAction}
              onChange={(value) => setSelectedAppAction(value ?? '')}
              data={(spaceAppActions || []).map(appAction => ({ value: `${appAction.app_name}__${appAction.name}`, label: `${appAction.app_name} ${appAction.title} - ${appAction.instance_alias}` }))}
              placeholder="Select App Action"
              variant="filled"
              searchable
            />
            <Button type="submit" loading={submitting}>
              Send to App
            </Button>
          </Stack>
        </form>
      </Modal> */}
  </>
 );
}
