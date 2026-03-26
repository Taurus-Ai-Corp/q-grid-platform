import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bone)] flex items-center justify-center p-6">
      <div className="shadow-lg rounded-[var(--radius)] overflow-hidden">
        <SignUp />
      </div>
    </div>
  )
}
