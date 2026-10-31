import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export const WHATSAPP_NUMBER = "5551996824286";
export const WHATSAPP_LINK = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const SERVICES = [
  {
    id: "degrade",
    name: "Degradê",
    description: "Degradê na máquina + acabamento fino",
    price: 30,
    duration: "40 min",
    icon: "scissors",
    popular: false,
  },
  {
    id: "degrade-navalhado",
    name: "Degradê Navalhado",
    description: "Degradê + detalhe com navalha",
    price: 35,
    duration: "50 min",
    icon: "scissors",
    popular: true,
  },
  {
    id: "barba",
    name: "Barba",
    description: "Toalha quente + navalha + modelo",
    price: 17,
    duration: "30 min",
    icon: "shopping-bag",
    popular: false,
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description: "Combo completo: degradê + barba",
    price: 45,
    duration: "60 min",
    icon: "star",
    popular: false,
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Escolha o serviço",
    text: "Corte, barba ou combo premium",
  },
  {
    step: "2",
    title: "Escolha dia e hora",
    text: "Só aparece o que está livre",
  },
  {
    step: "3",
    title: "Confirme no aplicativo",
    text: "Pagamento no atendimento",
  },
] as const;
