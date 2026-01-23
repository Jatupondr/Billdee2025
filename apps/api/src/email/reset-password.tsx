import * as React from 'react'
import { Tailwind, Section, Text, Button, Link } from '@react-email/components'

interface ResetPasswordEmailProps {
    to: string
    subject: string
    url: string
}

export default function ResetPasswordEmail({ to, subject, url }: ResetPasswordEmailProps) {

    return (
        <Tailwind>
            <Section className="w-full bg-gray-100 py-10">
                <Section
                    className="max-w-[360px] mx-auto bg-white rounded-2xl px-6 py-6"
                >
                    <Text className="text-sm font-semibold text-violet-600 text-center mb-2">
                        Reset your password
                    </Text>

                    <Text className="text-gray-600 text-sm text-center mb-4">
                        We received a request to reset your password.
                        Click the button below to set a new password.
                    </Text>

                    <Section className="text-center">
                        <a
                            href={url}
                            style={{
                                display: "inline-block",
                                backgroundColor: "#7c3aed",
                                color: "#ffffff",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                        >
                            Reset Password
                        </a>
                    </Section>

                    <Text className="text-gray-400 text-xs text-center mt-4">
                        This link will expire in 10 minutes.
                    </Text>

                    <Text className="text-gray-500 text-xs text-center mt-2">
                        If you didn’t request a password reset, you can safely ignore this email.
                    </Text>
                </Section>
            </Section>
        </Tailwind>

    )
}


