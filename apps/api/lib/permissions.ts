import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	project: ["create", "share", "update", "delete", "read"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
	project: ["create", "update"],
	...adminAc.statements,
});

export const user = ac.newRole({
	project: ["create", "share", "update", "delete"],
});

export const guest = ac.newRole({
	project: ["read"],
});
