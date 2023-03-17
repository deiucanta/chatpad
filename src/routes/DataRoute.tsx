import { Button, Container, Group } from "@mantine/core";
import download from "downloadjs";
import { db } from "../db";

export function DataRoute() {
  return (
    <Container>
      <Group>
        <Button
          onClick={async () => {
            const blob = await db.export();
            download(
              blob,
              `chatpad-export-${new Date().toLocaleString()}.json`,
              "application/json"
            );
          }}
        >
          Export Data
        </Button>
        <input
          id="file-upload-btn"
          type="file"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            if (!file) return;
            await db.import(file, {
              acceptNameDiff: true,
              overwriteValues: true,
              acceptMissingTables: true,
              clearTablesBeforeImport: true,
            });
          }}
          accept="application/json"
          hidden
        />
        <Button component="label" htmlFor="file-upload-btn">
          Import Data
        </Button>
        <Button
          onClick={async () => {
            await db.delete();
            localStorage.clear();
            window.location.assign("/");
          }}
        >
          Delete Data
        </Button>
      </Group>
    </Container>
  );
}
