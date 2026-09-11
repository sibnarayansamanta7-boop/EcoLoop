const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("../models/Listing");
const User = require("../models/User");
const Message = require("../models/Message");
const Request = require("../models/Request");

async function run() {
    await mongoose.connect(process.env.MONGO_URI);

    const listings = await Listing.find({}).select("_id title owner").lean();
    const ownerIds = listings.map((item) => item.owner).filter(Boolean);
    const users = await User.find({ _id: { $in: ownerIds } }).select("_id").lean();
    const validOwners = new Set(users.map((user) => String(user._id)));

    const orphaned = listings.filter((item) =>
        !item.owner || !validOwners.has(String(item.owner))
    );

    if (!orphaned.length) {
        console.log("No orphan listings found.");
        return;
    }

    const ids = orphaned.map((item) => item._id);
    await Message.deleteMany({ listing: { $in: ids } });
    await Request.deleteMany({ listing: { $in: ids } });
    await Listing.deleteMany({ _id: { $in: ids } });

    console.log(`Removed ${orphaned.length} orphan listing(s):`);
    orphaned.forEach((item) => console.log(`- ${item.title} (${item._id})`));
}

run()
    .catch((error) => {
        console.error("Cleanup failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
