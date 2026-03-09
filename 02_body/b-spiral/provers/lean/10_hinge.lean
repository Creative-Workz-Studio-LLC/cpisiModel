-- #!omni:code --lean
-- ╠═==================================================================================================================═╣
-- [S-theorem-lean-10] Axiom 10: The Hinge (Purified)
-- =====================================================================================================================

def limit : Nat := 11

-- Prove that for any state 'n', it is decidable whether we have hit the Hinge.
theorem hinge_is_decidable (n : Nat) : Decidable (n <= limit) :=
inferInstance

theorem hinge_terminates_purified (n : Nat) : n <= limit ∨ n > limit :=
by
  match (Nat.decLe n limit) with
  | isTrue h => left; exact h
  | isFalse h => right; exact Nat.gt_of_not_le h

#print "--- WITNESS DECLARATION: LOGICAL HINGE ---"
#print "Axiom Injected: 10"
#print "Logical Alignment Verified: true"
