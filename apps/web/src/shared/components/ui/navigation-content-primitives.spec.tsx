import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Avatar, AvatarFallback } from "./avatar";
import { Card, CardContent, CardTitle } from "./card";
import { Dialog, DialogContent } from "./dialog";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";
import { Switch } from "./switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Toggle } from "./toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("generated navigation and content primitives", () => {
  it("supports controlled tabs and exposes selection state", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList aria-label="Sections">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First content</TabsContent>
        <TabsContent value="two">Second content</TabsContent>
      </Tabs>,
    );

    const first = screen.getByRole("tab", { name: "One" });
    const second = screen.getByRole("tab", { name: "Two" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveAttribute("aria-selected", "false");
  });

  it("keeps tab navigation horizontal and gives the active panel a scroll boundary", () => {
    render(
      <Dialog open>
        <DialogContent>
          <Tabs defaultValue="one" className="min-h-0 flex-1">
            <TabsList className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="one">A very long tab label</TabsTrigger>
              <TabsTrigger value="two">Another long tab label</TabsTrigger>
            </TabsList>
            <TabsContent value="one">First content</TabsContent>
            <TabsContent value="two">Second content</TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    const tabs = screen.getByRole("tablist");
    const activePanel = screen.getByRole("tabpanel");

    expect(dialog).toHaveClass("flex", "min-h-0");
    expect(tabs).toHaveClass("no-scrollbar", "overflow-x-auto", "overflow-y-hidden");
    expect(activePanel).toHaveClass("min-h-0", "overflow-y-auto", "styled-scrollbar");
    expect(screen.getByRole("tab", { name: "A very long tab label" })).toHaveClass("flex-1");
  });

  it("exposes toggle and switch state through accessible state attributes", () => {
    render(
      <>
        <Toggle aria-label="Pin">Pin</Toggle>
        <Switch aria-label="Notifications" />
      </>,
    );

    const toggle = screen.getByRole("button", { name: "Pin" });
    const switchControl = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(switchControl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    fireEvent.click(switchControl);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(switchControl).toHaveAttribute("aria-checked", "true");
  });

  it("opens accordion content and preserves semantic card and table markup", () => {
    render(
      <>
        <Accordion type="single" defaultValue="details">
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>More information</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Card>
          <CardTitle>Summary</CardTitle>
          <CardContent>Card content</CardContent>
        </Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Aisha</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>,
    );

    expect(screen.getByText("More information")).toBeVisible();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAccessibleName("");
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  });

  it("provides avatar fallback, tooltip semantics, and a collapsible sidebar", () => {
    render(
      <TooltipProvider>
        <Avatar>
          <AvatarFallback>AF</AvatarFallback>
        </Avatar>
        <Tooltip>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>Helpful text</TooltipContent>
        </Tooltip>
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Home</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarTrigger aria-label="Toggle sidebar" />
        </SidebarProvider>
      </TooltipProvider>,
    );

    expect(screen.getByText("AF")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Toggle sidebar" });
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toHaveAttribute("data-state", "expanded");
    fireEvent.click(trigger);
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  it("supports controlled state and the keyboard sidebar shortcut", () => {
    const onOpenChange = vi.fn();

    render(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <Sidebar collapsible="none" />
        <SidebarTrigger aria-label="Toggle sidebar" />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
