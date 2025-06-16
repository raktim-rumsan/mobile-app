import { Link } from "expo-router";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView } from "@/components/ui/scroll-view";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background-0" contentContainerClassName="px-4 py-4 pb-8">
      {/* Header */}
      <HStack className="items-center justify-between mb-4">
        <VStack>
          <Text className="text-2xl font-bold">Good morning!</Text>
          <Text className="text-typography-500">Welcome back, John</Text>
          <Link href="/chat">
            <Text>Chat with AI</Text>
          </Link>
        </VStack>
        <Box className="bg-success-100 rounded-xl px-3 py-1">
          <Text className="text-success-900 font-bold text-sm">Active</Text>
        </Box>
      </HStack>

      {/* Employee ID Card (no gradient) */}
      <Box className="rounded-xl bg-primary-100 mb-6 items-center p-6 shadow-sm">
        <Text className="text-primary-900 font-bold text-lg mb-4">Your Employee ID</Text>
        <Box className="bg-white rounded-lg w-28 h-28 items-center justify-center mb-4">
          {/* Placeholder for QR/ID */}
          <Box className="bg-background-100 w-20 h-20 rounded-md items-center justify-center">
            <FontAwesome name="user" size={40} color="#E5E7EB" />
          </Box>
        </Box>
        <Text className="text-primary-900 text-sm text-center">
          Scan to check in/out or access facilities
        </Text>
      </Box>

      {/* Stats Cards */}
      <VStack className="space-y-4">
        <HStack className="space-x-4 space-y-4">
          <Box className="flex-1 bg-white rounded-xl p-5 shadow-sm m-1">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Time Off Taken</Text>
              <Box className="bg-primary-500 rounded-lg p-1.5">
                <FontAwesome name="clock-o" size={16} color="#fff" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">12 days</Text>
            <Text className="text-typography-500 text-sm">This year</Text>
          </Box>
          <Box className="flex-1 bg-white rounded-xl p-5 shadow-sm m-1">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Rewards Earned</Text>
              <Box className="bg-yellow-400 rounded-lg p-1.5">
                <FontAwesome name="trophy" size={16} color="#fff" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">2,450</Text>
            <Text className="text-typography-500 text-sm">Points</Text>
          </Box>
        </HStack>
        <HStack className="space-x-4 space-y-4">
          <Box className="flex-1 bg-white rounded-xl p-5 shadow-sm m-1">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Bonus Earned</Text>
              <Box className="bg-success-400 rounded-lg p-1.5">
                <FontAwesome name="dollar" size={16} color="#fff" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">$1,200</Text>
            <Text className="text-typography-500 text-sm">This quarter</Text>
          </Box>
          <Box className="flex-1 bg-white rounded-xl p-5 shadow-sm m-1">
            <HStack className="items-center justify-between">
              <Text className="text-typography-700 font-medium">Goals Completed</Text>
              <Box className="bg-purple-400 rounded-lg p-1.5">
                <FontAwesome name="bullseye" size={16} color="#fff" />
              </Box>
            </HStack>
            <Text className="text-2xl font-bold mt-2">8/10</Text>
            <Text className="text-typography-500 text-sm">This month</Text>
          </Box>
        </HStack>
      </VStack>

      {/* Quick Actions */}
      <Box className="bg-white rounded-xl p-4 mt-6 shadow-sm">
        <Text className="font-bold text-base mb-3">Quick Actions</Text>
        <VStack className="space-y-2">
          <Pressable>
            {(pressableProps: { pressed: boolean }) => (
              <HStack
                className={`items-center p-3 rounded-lg ${
                  pressableProps.pressed ? "bg-primary-50" : "bg-background-0"
                }`}
              >
                <Box className="bg-primary-500 rounded-md p-1.5 mr-3">
                  <FontAwesome name="calendar" size={18} color="#fff" />
                </Box>
                <Text className="flex-1 font-medium">Request Time Off</Text>
                <FontAwesome name="angle-right" size={18} color="#A0AEC0" />
              </HStack>
            )}
          </Pressable>
          <Pressable>
            {(pressableProps: { pressed: boolean }) => (
              <HStack
                className={`items-center p-3 rounded-lg ${
                  pressableProps.pressed ? "bg-success-50" : "bg-background-0"
                }`}
              >
                <Box className="bg-success-400 rounded-md p-1.5 mr-3">
                  <FontAwesome name="gift" size={18} color="#fff" />
                </Box>
                <Text className="flex-1 font-medium">Redeem Rewards</Text>
                <FontAwesome name="angle-right" size={18} color="#A0AEC0" />
              </HStack>
            )}
          </Pressable>
        </VStack>
      </Box>
    </ScrollView>
  );
}
