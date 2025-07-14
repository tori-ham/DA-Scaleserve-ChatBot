type SidebarProps = {
    conversations: {
        id: number;
        title: string;
    }[];
    currentId: number | null;
    onSelect: (id: number) => void;
    onNewChat: () => void;
    onUpdateTitle: (id: number, newTitle: string) => void;
    onDeleteChat: (id: number) => void
}

type ModelRoutingInfoItem = {
    selected_model: string;
    scores: Record<string, number>
}

type ModelRoutingCandidate = {
    model? : string | null;
    score?: number | null;
    grade_label?: string | null;
    grade_value?: string | null;
}

type ModelRoutingInfoItem = {
    selected_model: string;
    grades?: ModelRoutingCandidate[]|null;
}

type ModelRoutingInfoProps = {
    routing : ModelRoutingInfoItem;
    grades? : ModelRoutingCandidate[]|null;
}

type ChatInputProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}

type ChatMessage = {
    role: string;
    content?: string|null;
    message?: string|null;
    isGenerating?: boolean|null;
    // routing?: any|null;
    query_routing?: ModelRoutingInfoProps|null;
}

type ChatWindowProps = {
    messages : ChatMessage[]
}

export {
    SidebarProps,
    ModelRoutingInfoItem,
    ModelRoutingInfoProps,
    ChatInputProps,
    ChatMessage,
    ChatWindowProps
}