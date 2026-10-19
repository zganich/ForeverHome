/** Cloud SQL's built-in Auth Proxy terminates the encrypted connection at this socket. */
export function cloudSqlSocket(
  connectionName = process.env.CLOUD_SQL_CONNECTION_NAME
) {
  if (!connectionName) return undefined;
  if (!/^[a-z][a-z0-9-]*:[a-z0-9-]+:[a-z][a-z0-9-]*$/.test(connectionName))
    throw new Error("Invalid Cloud SQL connection name");
  return `/cloudsql/${connectionName}/.s.PGSQL.5432`;
}

export function databaseOptions() {
  const path = cloudSqlSocket();
  return {
    prepare: false,
    max: 5,
    connect_timeout: 10,
    idle_timeout: 20,
    ...(path ? { path, ssl: false as const } : {}),
  };
}
