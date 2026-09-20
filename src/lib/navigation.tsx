'use client'

import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation'
import type React from 'react'

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>,
    NextLinkProps {
  href: string
  children?: React.ReactNode
  className?: string
}

export function Link({ href, children, ...props }: LinkProps) {
  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  )
}

export function useRouter() {
  const router = useNextRouter()
  return {
    push: (url: string) => router.push(url),
    replace: (url: string) => router.replace(url),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
  }
}

export function usePathname(): string {
  return useNextPathname() || '/'
}

export function useParams(): ReturnType<typeof useNextParams> {
  return useNextParams()
}
