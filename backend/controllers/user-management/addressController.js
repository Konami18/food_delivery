import userModel from "../../models/user/userModel.js";

// Add new address
const addAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const addressData = req.body.address;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // If this is the first address or marked as default, set it as default
        if (user.addresses.length === 0 || addressData.isDefault) {
            // Remove default from other addresses
            user.addresses.forEach(addr => addr.isDefault = false);
            addressData.isDefault = true;
        }

        user.addresses.push(addressData);
        await user.save();

        res.json({ success: true, message: "Address added successfully", data: user.addresses });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding address" });
    }
};

// Get all addresses
const getAddresses = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await userModel.findById(userId).select('addresses');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user.addresses });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching addresses" });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { addressId, addressData } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.json({ success: false, message: "Address not found" });
        }

        // If setting as default, remove default from others
        if (addressData.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses[addressIndex] = { ...user.addresses[addressIndex]._doc, ...addressData };
        await user.save();

        res.json({ success: true, message: "Address updated successfully", data: user.addresses });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating address" });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { addressId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.json({ success: false, message: "Address not found" });
        }

        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);

        // If deleted address was default, make first address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ success: true, message: "Address deleted successfully", data: user.addresses });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting address" });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { addressId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Remove default from all addresses
        user.addresses.forEach(addr => addr.isDefault = false);

        // Set new default
        const address = user.addresses.find(addr => addr._id.toString() === addressId);
        if (address) {
            address.isDefault = true;
            await user.save();
            res.json({ success: true, message: "Default address updated", data: user.addresses });
        } else {
            res.json({ success: false, message: "Address not found" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error setting default address" });
    }
};

export { addAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress };
