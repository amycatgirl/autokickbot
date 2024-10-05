/**
 * Can we kick this guy
 * @param {string} id - User ID
 * @param {import("revolt.js").Server} server - Target Server
 * @param {import("revolt.js").Client} ctx - Context client
 */
export const canKick = async (id, server, ctx) => {
  const targetUser = await server.fetchMember(id);
  if (!ctx.user) return false

  const self = await server.fetchMember(ctx.user._id);
  return (
    self.hasPermission(server, "KickMembers") &&
    targetUser.inferiorTo(self) &&
    server.owner !== targetUser.user?._id
  );
};

