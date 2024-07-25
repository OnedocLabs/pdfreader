import type { Meta, StoryObj } from "@storybook/react";

import { Example } from "../";

const meta: Meta<typeof Example> = {
  component: Example,
};

export default meta;
type Story = StoryObj<typeof Example>;

export const Primary: Story = {
  name: "With Thumbnails",
  args: {
    fileURL: "brochure.pdf",
  },
};
