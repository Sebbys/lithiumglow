export default function Loading() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a className="flex items-center gap-2 font-medium" aria-hidden>
            <div className="bg-primary/20 flex size-6 items-center justify-center rounded-md animate-pulse" style={{width: 40, height: 40}} />
            <span className="h-6 w-32 rounded-md bg-primary/20 animate-pulse" />
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-6 w-48 rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-72 rounded-md bg-muted/30 animate-pulse" />
              </div>

              <div className="grid gap-6">
                <div className="space-y-3">
                  <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
                  <div className="h-10 rounded-md bg-muted/20 animate-pulse" />
                </div>

                <div className="space-y-3">
                  <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
                  <div className="h-10 rounded-md bg-muted/20 animate-pulse" />
                </div>

                <div className="h-10 rounded-md bg-primary/20 animate-pulse" />

                <div className="relative text-center text-sm">
                  <div className="h-px bg-border mx-4" />
                  <div className="mx-auto w-36 -mt-3 bg-background text-muted-foreground text-sm text-center"> </div>
                </div>
              </div>

              <div className="text-center text-sm">
                <div className="h-4 w-40 mx-auto rounded bg-muted/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale bg-[url('/Kingdom.png')] bg-center bg-cover filter blur-sm/0 opacity-30" />
      </div>
    </div>
  )
}