import { DirectoryTable } from "@/components/eyi/directory-table"

export default function DirectoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-8">
        <h1 className="text-balance text-3xl md:text-4xl font-bold leading-tight">EYI Directory</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Browse verified identities and their powers. Search by ENS name to find specific users.
        </p>
      </header>

      <section className="eyi-glass rounded-xl p-4 md:p-6">
        <DirectoryTable />
      </section>
    </main>
  )
}
