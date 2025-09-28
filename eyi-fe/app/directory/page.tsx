import { DirectoryTable } from "@/components/eyi/directory-table"
import { UserAccountDetails } from "@/components/eyi/user-account-details"
import { HomographAnalysis } from "@/components/eyi/homograph-analysis"

export default function DirectoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-8">
        <h1 className="text-balance text-3xl md:text-4xl font-bold leading-tight">EYI Directory</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Browse verified identities and their powers. Search by ENS name to find specific users.
        </p>
      </header>

      <div className="space-y-6">
        {/* User Account Details Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Account</h2>
          <UserAccountDetails />
        </section>

        {/* Directory Table Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Directory</h2>
          <div className="eyi-glass rounded-xl p-4 md:p-6">
            <DirectoryTable />
          </div>
        </section>

        {/* Homograph Risk Analysis Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Security Analysis</h2>
          <HomographAnalysis />
        </section>
      </div>
    </main>
  )
}
