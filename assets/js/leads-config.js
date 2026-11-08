/* Onde os cadastros do blog são gravados. Preencher depois de criar a tabela `leads` (script: scripts/leads_supabase.sql).
   A chave "anon" (publishable) do Supabase é pública por desenho: a tabela só aceita INSERT (RLS), ninguém lê pelo navegador.
   Enquanto estiver vazio, o formulário avisa que o cadastro ainda não está ligado e NÃO libera o brinde. */
window.JGA_LEADS = {
  url: "https://xnarpedqtbqtvdsgrdkp.supabase.co",
  anonKey: "sb_publishable_N_6i82Ly8nz2aC5ZmaOEgA_6PCu7jWe",
  tabela: "leads"
};
